import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import CollisionSimulator from "@/components/CollisionSimulator";

export default function Index() {
  const navigate = useNavigate();
  const { level } = useParams();

  return (
    <>
      <Button
        variant="secondary"
        className="fixed left-4 top-4 z-[100] bg-white/90 hover:bg-white border"
        onClick={() => navigate(`/nivel/${level ?? "1"}/intro`)}
      >
        ← Volver al inicio
      </Button>

      <CollisionSimulator />
    </>
  );
}

