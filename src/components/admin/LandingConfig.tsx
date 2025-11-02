import React, { useEffect, useState } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { db } from '../../config/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type Hero = {
  brandName?: string;
  subtitle?: string;
  description?: string;
  slogan?: string;
  logo?: string; // data URL o URL normal
};

export const LandingConfig: React.FC = () => {
  const [hero, setHero] = useState<Hero>({});
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const off = onValue(ref(db, 'landing/hero'), (snap) => {
      setHero(snap.val() || {});
    });
    return () => off();
  }, []);

  const save = async () => {
    try {
      await update(ref(db, 'landing/hero'), hero);
      toast({ title: 'Inicio guardado', description: 'Se actualizaron los datos del Hero.' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar.', variant: 'destructive' });
    }
  };

  const importFromEmpresa = async () => {
    try {
      const snap = await get(ref(db, 'empresa'));
      const e = snap.val() || {};
      const imported: Hero = {
        brandName: e.name || e.businessName || '',
        subtitle: e.welcomeMessage || '',
        description: e.description || '',
        slogan: e.slogan || '',
        logo: e.logo || e.logoUrl || '',
      };
      setHero(imported);
      toast({ title: 'Importado', description: 'Se cargaron datos desde /empresa.' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo leer /empresa.', variant: 'destructive' });
    }
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setHero((h) => ({ ...h, logo: String(reader.result) })); // data URL base64
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inicio (Hero)</CardTitle>
        <CardDescription>Contenido que se muestra en la página principal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brandName">Nombre (marca)</Label>
            <Input
              id="brandName"
              value={hero.brandName || ''}
              onChange={(e) => setHero({ ...hero, brandName: e.target.value })}
              placeholder="Pecaditos"
            />
          </div>
          <div>
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={hero.subtitle || ''}
              onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
              placeholder="Los mejores sabores artesanales..."
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={hero.description || ''}
            onChange={(e) => setHero({ ...hero, description: e.target.value })}
            placeholder="Texto de bienvenida..."
          />
        </div>

        <div>
          <Label htmlFor="slogan">Slogan</Label>
          <Input
            id="slogan"
            value={hero.slogan || ''}
            onChange={(e) => setHero({ ...hero, slogan: e.target.value })}
            placeholder="Porque cuidarte nunca fue tan delicioso"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="logoUrl">Logo (URL o data URL)</Label>
            <Input
              id="logoUrl"
              value={hero.logo || ''}
              onChange={(e) => setHero({ ...hero, logo: e.target.value })}
              placeholder="https://.../logo.png o data:image/png;base64,..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Puedes pegar un enlace público o usar el botón para subir y guardaremos en base64.
            </p>
          </div>
          <div>
            <Label>Subir logo desde tu PC</Label>
            <div className="flex items-center gap-2">
              <Input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
              <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Previsualizar
              </Button>
            </div>
            {hero.logo ? (
              <img src={hero.logo} alt="preview" className="h-16 mt-2 object-contain rounded" />
            ) : (
              <div className="text-xs text-muted-foreground mt-2">Sin logo seleccionado</div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <Button type="button" variant="outline" onClick={importFromEmpresa}>
            Importar desde Empresa
          </Button>
          <Button type="button" onClick={save}>
            Guardar Inicio
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
