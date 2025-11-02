import React, { useState } from "react";
import type { JSX } from 'react';

type CompanyInfo = {
  logo?: string;
  name?: string;
  slogan?: string;
  description?: string;
  fiscalAddress?: string;
  phone?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  tiktok?: string;
  youtube?: string;
};

export default function LivePreview({ companyInfo }: { companyInfo?: CompanyInfo }): JSX.Element {
  const [device, setDevice] = useState("mobile");
  const [show, setShow] = useState(false);

  // Botón flotante "ojito"
  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        style={{
          position: "fixed",
          bottom: 40,
          right: 40,
          zIndex: 50,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 4px 14px rgba(0,0,0,0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          cursor: "pointer"
        }}
        title="Mostrar vista previa"
      >
        <span role="img" aria-label="ojo" style={{ fontSize: 28 }}>👁️</span>
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 70,
        right: 40,
        zIndex: 1100,
        width: device === "mobile" ? 380 : 1000,
        height: device === "mobile" ? 740 : 670,
        borderRadius: device === "mobile" ? 38 : 20,
        border: "3px solid #e5e5e5",
        boxShadow: "0 8px 32px 4px #0002",
        background: "#fff",
        overflow: "hidden",
        transition: "all .3s cubic-bezier(.4,0,.2,1)"
      }}
    >
      {/* Barra superior */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 8,
          background: "#f7f7f7",
          borderBottom: "1px solid #ececec"
        }}
      >
        <div>
          <button
            style={{
              marginRight: 8,
              padding: "7px 20px",
              borderRadius: 8,
              border: "none",
              fontWeight: "bold",
              background: device === "desktop" ? "#2d3748" : "#fff",
              color: device === "desktop" ? "#fff" : "#333",
              cursor: "pointer",
              transition: "background .2s"
            }}
            onClick={() => setDevice("desktop")}
            title="Ver como PC"
          >
            PC
          </button>
          <button
            style={{
              padding: "7px 20px",
              borderRadius: 8,
              border: "none",
              fontWeight: "bold",
              background: device === "mobile" ? "#2d3748" : "#fff",
              color: device === "mobile" ? "#fff" : "#333",
              cursor: "pointer",
              transition: "background .2s"
            }}
            onClick={() => setDevice("mobile")}
            title="Ver como Móvil"
          >
            Móvil
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 12, color: "#888" }}>Vista en vivo</span>
          <button
            onClick={() => setShow(false)}
            style={{
              border: "none",
              background: "transparent",
              color: "#888",
              fontWeight: "bold",
              fontSize: 24,
              cursor: "pointer",
              marginLeft: 2
            }}
            title="Cerrar Vista Previa"
          >
            ✖️
          </button>
        </div>
      </div>
      {/* Notch móvil */}
      {device === "mobile" && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 9,
            transform: "translateX(-50%)",
            width: 74,
            height: 7,
            borderRadius: 7,
            background: "#d5d5d5"
          }}
        />
      )}

      {/* Contenido */}
      <div
        style={{
          padding: device === "mobile" ? 24 : 48,
          paddingTop: device === "mobile" ? 32 : 50,
          textAlign: "center",
          fontFamily: "inherit"
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 24 }}>
          {companyInfo?.logo ? (
            <img
              src={companyInfo.logo}
              alt="Logo"
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: "#eee",
                margin: "auto",
                objectFit: "cover"
              }}
            />
          ) : (
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: "#ececec",
                margin: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                color: "#bbb"
              }}
            >
              {companyInfo?.name?.[0] || "L"}
            </div>
          )}
        </div>

        {/* Nombre y Slogan */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 22, fontWeight: "bold", color: "#222" }}>
            {companyInfo?.name || "Nombre Empresa"}
          </div>
          <div style={{ color: "#e48e2c", margin: "8px 0 0 0", fontWeight: "bold" }}>
            {companyInfo?.slogan || "Slogan"}
          </div>
        </div>
        <div style={{ margin: "16px 0", fontSize: 15, color: "#444" }}>
          {companyInfo?.description || "Descripción de tu empresa..."}
        </div>

        {/* Bloques de info en dos columnas (sólo en desktop) */}
        <div
          style={{
            display: device === "desktop" ? "flex" : "block",
            gap: 50,
            justifyContent: "center",
            margin: "26px 0 8px 0"
          }}
        >
          <div style={{ minWidth: 230 }}>
            <div style={{ color: "#888", fontSize: 13, marginBottom: 2, fontWeight: 500 }}>Dirección</div>
            <div style={{ color: "#333", fontSize: 15, fontWeight: 600 }}>
              {companyInfo?.fiscalAddress || "-"}
            </div>
          </div>
          <div style={{ minWidth: 230, marginTop: device === "desktop" ? 0 : 16 }}>
            <div style={{ color: "#888", fontSize: 13, marginBottom: 2, fontWeight: 500 }}>Teléfono</div>
            <div style={{ color: "#333", fontSize: 15, fontWeight: 600 }}>
              {companyInfo?.phone || "-"}
            </div>
          </div>
          <div style={{ minWidth: 230, marginTop: device === "desktop" ? 0 : 16 }}>
            <div style={{ color: "#888", fontSize: 13, marginBottom: 2, fontWeight: 500 }}>Email</div>
            <div style={{ color: "#333", fontSize: 15, fontWeight: 600 }}>
              {companyInfo?.email || "-"}
            </div>
          </div>
        </div>

        {/* Redes sociales, solo si existen */}
        <div style={{ marginTop: 24, fontSize: 15 }}>
          {companyInfo?.facebook && (
            <a href={companyInfo.facebook} target="_blank" rel="noopener noreferrer" style={{ marginRight: 14, color: "#4064ac", textDecoration: "none" }}>Facebook</a>
          )}
          {companyInfo?.instagram && (
            <a href={companyInfo.instagram} target="_blank" rel="noopener noreferrer" style={{ marginRight: 14, color: "#e1306c", textDecoration: "none" }}>Instagram</a>
          )}
          {companyInfo?.whatsapp && (
            <a href={`https://wa.me/${companyInfo.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ marginRight: 14, color: "#25D366", textDecoration: "none" }}>WhatsApp</a>
          )}
          {companyInfo?.tiktok && (
            <a href={companyInfo.tiktok} target="_blank" rel="noopener noreferrer" style={{ marginRight: 14, color: "#111", textDecoration: "none" }}>TikTok</a>
          )}
          {companyInfo?.youtube && (
            <a href={companyInfo.youtube} target="_blank" rel="noopener noreferrer" style={{ marginRight: 14, color: "#f00", textDecoration: "none" }}>YouTube</a>
          )}
        </div>
      </div>
    </div>
  );
}
