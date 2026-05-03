import { useEffect, useState } from "react";
import PrivateWorkspaceLayout from "../../components/dashboard/PrivateWorkspaceLayout";
import { getMyProfile } from "../../api/profile";
import type { Perfil } from "../../types/profile";

export default function ExperiencePage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyProfile();
        setPerfil(data.perfil || null);
      } catch {
        setPerfil(null);
      }
    };

    loadProfile();
  }, []);

  return (
    <PrivateWorkspaceLayout active="experience" perfil={perfil} title="Experiencia" subtitle="">
      <section className="surface-card workspace-section-card">
        <div className="workspace-section-head">
          <div>
            <p className="section-label">Proximos sprints</p>
            <h2>Experiencia profesional</h2>
            <p className="workspace-form-note">
              Esta seccion todavia esta en construccion. Cuando se active, podras registrar experiencia laboral,
              practicas, voluntariados o participaciones profesionales.
            </p>
          </div>
        </div>
      </section>
    </PrivateWorkspaceLayout>
  );
}
