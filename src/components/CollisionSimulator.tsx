import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Car {
  mass: number;
  initialVelocity: number;
  currentVelocity: number;
  position: number;
  id: string;
  color: string;
}

interface PhysicsData {
  totalMomentumBefore: number;
  totalMomentumAfter: number;
  totalEnergyBefore: number;
  totalEnergyAfter: number;
}

export const CollisionSimulator = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasCollided, setHasCollided] = useState(false);
  const animationRef = useRef<number>();
  
  const [carA, setCarA] = useState<Car>({
    mass: 4.0,
    initialVelocity: 5.0,
    currentVelocity: 5.0,
    position: 100,
    id: "carA",
    color: "car-red"
  });
  
  const [carB, setCarB] = useState<Car>({
    mass: 4.0,
    initialVelocity: -3.0,
    currentVelocity: -3.0,
    position: 500,
    id: "carB",
    color: "car-blue"
  });

  const [physicsData, setPhysicsData] = useState<PhysicsData>({
    totalMomentumBefore: 0,
    totalMomentumAfter: 0,
    totalEnergyBefore: 0,
    totalEnergyAfter: 0
  });

  // Calculate physics values
  useEffect(() => {
    const momentumBefore = carA.mass * carA.initialVelocity + carB.mass * carB.initialVelocity;
    const energyBefore = 0.5 * carA.mass * Math.pow(carA.initialVelocity, 2) + 0.5 * carB.mass * Math.pow(carB.initialVelocity, 2);
    
    const momentumAfter = carA.mass * carA.currentVelocity + carB.mass * carB.currentVelocity;
    const energyAfter = 0.5 * carA.mass * Math.pow(carA.currentVelocity, 2) + 0.5 * carB.mass * Math.pow(carB.currentVelocity, 2);
    
    setPhysicsData({
      totalMomentumBefore: momentumBefore,
      totalMomentumAfter: momentumAfter,
      totalEnergyBefore: energyBefore,
      totalEnergyAfter: energyAfter
    });
  }, [carA, carB]);

  // Elastic collision calculation
  const calculateElasticCollision = (car1: Car, car2: Car) => {
    const m1 = car1.mass;
    const m2 = car2.mass;
    const v1 = car1.initialVelocity;
    const v2 = car2.initialVelocity;
    
    const v1Final = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
    const v2Final = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
    
    return { v1Final, v2Final };
  };

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      setCarA(prev => {
        const newPosition = prev.position + prev.currentVelocity * 0.5;
        return { ...prev, position: newPosition };
      });
      
      setCarB(prev => {
        const newPosition = prev.position + prev.currentVelocity * 0.5;
        return { ...prev, position: newPosition };
      });

      // Check for collision
      if (Math.abs(carA.position - carB.position) < 50 && !hasCollided) {
        setHasCollided(true);
        const { v1Final, v2Final } = calculateElasticCollision(carA, carB);
        
        setCarA(prev => ({ ...prev, currentVelocity: v1Final }));
        setCarB(prev => ({ ...prev, currentVelocity: v2Final }));
        
        toast("¡Colisión! Los carros han intercambiado energía", {
          description: "Observa cómo se conservan el momento y la energía"
        });
      }

      // Stop if cars are too far apart after collision
      if (hasCollided && (carA.position > 700 || carA.position < 0 || carB.position > 700 || carB.position < 0)) {
        setIsPlaying(false);
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, carA.position, carB.position, hasCollided]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setHasCollided(false);
    setCarA(prev => ({
      ...prev,
      position: 100,
      currentVelocity: prev.initialVelocity
    }));
    setCarB(prev => ({
      ...prev,
      position: 500,
      currentVelocity: prev.initialVelocity
    }));
    toast("Simulación reiniciada");
  };

  const updateCarMass = (carId: string, mass: number) => {
    if (carId === "carA") {
      setCarA(prev => ({ ...prev, mass }));
    } else {
      setCarB(prev => ({ ...prev, mass }));
    }
  };

  const updateCarVelocity = (carId: string, velocity: number) => {
    if (carId === "carA") {
      setCarA(prev => ({ 
        ...prev, 
        initialVelocity: velocity,
        currentVelocity: hasCollided ? prev.currentVelocity : velocity
      }));
    } else {
      setCarB(prev => ({ 
        ...prev, 
        initialVelocity: velocity,
        currentVelocity: hasCollided ? prev.currentVelocity : velocity
      }));
    }
  };

  return (
    <div className="min-h-screen bg-sky-gradient">
      {/* Sky and road background */}
      <div className="relative w-full h-screen overflow-hidden">
        
        {/* Title */}
        <div className="text-center pt-8 pb-4">
          <h1 className="text-4xl font-bold text-foreground mb-2">Choque Directo</h1>
          <p className="text-lg text-muted-foreground">Simulación de Colisión Elástica</p>
        </div>

        {/* Control panels */}
        <div className="flex justify-between px-8 mb-8">
          {/* Car A Controls */}
          <Card className="p-4 bg-control-panel border-control-panel-border">
            <h3 className="font-semibold mb-3">Masa A (kg)</h3>
            <Slider
              value={[carA.mass]}
              onValueChange={([value]) => updateCarMass("carA", value)}
              max={10}
              min={1}
              step={0.1}
              className="mb-4"
            />
            <div className="text-center text-sm text-muted-foreground">{carA.mass.toFixed(1)} kg</div>
            
            <h3 className="font-semibold mb-3 mt-4">Velocidad Inicial A (m/s)</h3>
            <Slider
              value={[carA.initialVelocity]}
              onValueChange={([value]) => updateCarVelocity("carA", value)}
              max={10}
              min={0}
              step={0.1}
              className="mb-4"
            />
            <div className="text-center text-sm text-muted-foreground">{carA.initialVelocity.toFixed(1)} m/s</div>
          </Card>

          {/* Physics Data Display */}
          <Card className="p-4 bg-control-panel border-control-panel-border">
            <h3 className="font-semibold mb-3">Conservación del momento y la energía cinética</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Momento Total (Kg-m/s):</span>
                <span className="font-mono">{physicsData.totalMomentumBefore.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Energía Cinética Total (J):</span>
                <span className="font-mono">{physicsData.totalEnergyBefore.toFixed(1)}</span>
              </div>
            </div>
          </Card>

          {/* Car B Controls */}
          <Card className="p-4 bg-control-panel border-control-panel-border">
            <h3 className="font-semibold mb-3">Masa B (kg)</h3>
            <Slider
              value={[carB.mass]}
              onValueChange={([value]) => updateCarMass("carB", value)}
              max={10}
              min={1}
              step={0.1}
              className="mb-4"
            />
            <div className="text-center text-sm text-muted-foreground">{carB.mass.toFixed(1)} kg</div>
            
            <h3 className="font-semibold mb-3 mt-4">Velocidad Inicial B (m/s)</h3>
            <Slider
              value={[carB.initialVelocity]}
              onValueChange={([value]) => updateCarVelocity("carB", value)}
              max={0}
              min={-10}
              step={0.1}
              className="mb-4"
            />
            <div className="text-center text-sm text-muted-foreground">{carB.initialVelocity.toFixed(1)} m/s</div>
          </Card>
        </div>

        {/* Road and cars */}
        <div className="relative w-full h-48 bg-road-dark mx-auto">
          {/* Road markings */}
          <div className="absolute top-1/2 w-full h-1 bg-yellow-400 transform -translate-y-1/2">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 w-8 h-1 bg-road-dark"
                style={{ left: `${i * 40}px` }}
              />
            ))}
          </div>

          {/* Car A */}
          <div
            className="absolute top-8 w-16 h-12 bg-car-red rounded-lg shadow-lg transition-all duration-100 flex items-center justify-center"
            style={{ left: `${carA.position}px` }}
          >
            <div className="text-white text-xs font-bold">
              m = {carA.mass.toFixed(1)} kg<br/>
              V(A) = {carA.currentVelocity.toFixed(1)} m/s
            </div>
          </div>

          {/* Car B */}
          <div
            className="absolute bottom-8 w-16 h-12 bg-car-blue rounded-lg shadow-lg transition-all duration-100 flex items-center justify-center"
            style={{ left: `${carB.position}px` }}
          >
            <div className="text-white text-xs font-bold">
              m = {carB.mass.toFixed(1)} kg<br/>
              V(B) = {carB.currentVelocity.toFixed(1)} m/s
            </div>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button 
            onClick={handlePlay}
            className="bg-button-secondary text-white hover:opacity-90"
          >
            {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isPlaying ? "Pausa" : "Inicio"}
          </Button>
          
          <Button 
            onClick={handleReset}
            className="bg-button-danger text-white hover:opacity-90"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar
          </Button>
        </div>

        {/* Physics explanation */}
        <div className="mt-8 px-8 max-w-4xl mx-auto">
          <Card className="p-6 bg-control-panel border-control-panel-border">
            <h3 className="font-semibold mb-2">Aprendizaje:</h3>
            <p className="text-sm text-muted-foreground">
              Comprende y verifica visualmente que, en una colisión elástica, el momento lineal total antes del choque es igual al momento lineal total después del choque (P(total,inicial) = P(total,final)) que la energía cinética total también se conserva.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};