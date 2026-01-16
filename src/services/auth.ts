// src/services/auth.ts
import { supabase } from "@/config/supabase";

// --- FUNCIÓN PRINCIPAL (LOGIN) ---
export async function signInAndEnsureProfile(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('No se pudo autenticar el usuario');

  await ensureUserProfile(data.user);
  return data.user;
}

// --- FUNCIÓN (CREAR/ACTUALIZAR PERFIL) ---
async function ensureUserProfile(user: any) {
  // Verificar si es email de portal mayorista
  const isWholesaleEmail = user.email && user.email.includes('@sys.pecaditos.com');
  
  if (!isWholesaleEmail) {
    // Usuario administrativo
    const { data: existingProfile, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Si existe Y tiene rol válido, no hacer nada
    if (existingProfile && existingProfile.rol) {
      console.log('[Auth] Usuario administrativo existente con rol válido:', existingProfile.rol, 'email:', user.email);
      return;
    }
    
    // Si no existe o está corrupto, crear/reparar perfil
    console.log('[Auth] Creando/reparando perfil administrativo para:', user.email);
    
    const adminPayload = {
      id: user.id,
      email: user.email,
      nombre: user.user_metadata?.nombre || user.email?.split("@")[0] || "Usuario",
      rol: 'adminGeneral',
      activo: true,
      permissions: ['all'],
      access_modules: ['dashboard', 'orders', 'delivery', 'production', 'billing'],
    };
    
    const { error: upsertError } = await supabase
      .from('usuarios')
      .upsert(adminPayload);
    
    if (upsertError) {
      console.error('[Auth] Error al guardar perfil administrativo:', upsertError);
    }
    return;
  }

  // Usuario de portal mayorista
  console.log('[Auth] Sincronizando perfil de portal mayorista para uid:', user.id);

  const ruc = user.email.split('@')[0];
  console.log('[Auth] Buscando cliente por RUC:', ruc);
  
  // Buscar cliente por RUC
  const { data: clientData, error: clientError } = await supabase
    .from('clientes')
    .select('*')
    .eq('ruc', ruc)
    .single();
  
  if (clientError || !clientData) {
    console.warn('[Auth] No se encontró cliente con RUC:', ruc);
  }

  // Construir payload del perfil mayorista
  const clientModules = Array.isArray(clientData?.access_modules) 
    ? clientData.access_modules 
    : [];
  
  const payload: any = {
    id: user.id,
    email: user.email,
    nombre: clientData?.razon_social || user.email.split("@")[0],
    rol: 'retailUser',
    activo: clientData?.activo ?? true,
    permissions: clientModules,
    access_modules: clientModules,
    cliente_id: clientData?.id || null,
  };
  
  console.log('[Auth] Perfil mayorista actualizado con', clientModules.length, 'módulos');
  
  // Guardar/actualizar perfil mayorista
  const { error: upsertError } = await supabase
    .from('usuarios')
    .upsert(payload);
  
  if (upsertError) {
    console.error('[Auth] Error al guardar perfil mayorista:', upsertError);
  }
}

/**
 * Normaliza credenciales para el proveedor de autenticación.
 * Convierte RUC y PIN en Email y Password válidos para Supabase.
 */
export function formatAuthCredentials(
  identifier: string,
  accessCode: string
): { email: string; password: string } {
  const CLEAN_IDENTIFIER = identifier.trim();
  const CLEAN_ACCESS_CODE = accessCode.trim();

  // Generamos un correo "ficticio" único para el sistema
  const email = `${CLEAN_IDENTIFIER}@sys.pecaditos.com`.toLowerCase();
  
  // Creamos una contraseña fuerte combinando el PIN con una llave del sistema
  const password = `${CLEAN_ACCESS_CODE}SystemAuthKey`;

  return { email, password };
}
