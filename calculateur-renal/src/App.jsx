import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Calculator, AlertCircle } from 'lucide-react';

const defaultFormState = {
  age: '',
  weight: '',
  height: '',
  creatinine: '',
  sex: ''
};

const defaultResultsState = {
  cockcroftGault: null,
  mdrd: null,
  ckdEpi: null
};

const RenalCalculator = () => {
  const [formData, setFormData] = useState(defaultFormState);
  const [results, setResults] = useState(defaultResultsState);
  const [bmi, setBmi] = useState(null);
  const [bsa, setBsa] = useState(null);
  const [errors, setErrors] = useState({});
  const [recommendations, setRecommendations] = useState([]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.age || formData.age < 18 || formData.age > 120) {
      newErrors.age = "L'âge doit être entre 18 et 120 ans";
    }
    if (!formData.weight || formData.weight < 30 || formData.weight > 300) {
      newErrors.weight = "Le poids doit être entre 30 et 300 kg";
    }
    if (!formData.height || formData.height < 100 || formData.height > 250) {
      newErrors.height = "La taille doit être entre 100 et 250 cm";
    }
    if (!formData.creatinine || formData.creatinine < 20 || formData.creatinine > 2000) {
      newErrors.creatinine = "La créatinine doit être entre 20 et 2000 µmol/L";
    }
    if (!formData.sex) {
      newErrors.sex = "Veuillez sélectionner un sexe";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateBMI = (weight, height) => {
    if (weight && height) {
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const calculateBSA = (weight, height) => {
    if (weight && height) {
      return (0.007184 * Math.pow(height, 0.725) * Math.pow(weight, 0.425)).toFixed(2);
    }
    return null;
  };

  const calculate = () => {
    if (!validateForm()) return;

    const { age, weight, creatinine, sex } = formData;
    const ageNum = parseFloat(age);
    const weightNum = parseFloat(weight);
    const creatinineNum = parseFloat(creatinine);

    // Cockcroft-Gault
    const cockcroftGault = ((140 - ageNum) * weightNum * (sex === 'F' ? 0.85 : 1)) / (creatinineNum * 0.8136);

    // MDRD
    const mdrd = 175 * Math.pow(creatinineNum / 88.4, -1.154) * 
                 Math.pow(ageNum, -0.203) * 
                 (sex === 'F' ? 0.742 : 1);

    // CKD-EPI
    let ckdEpi;
    const scr = creatinineNum / 88.4;
    if (sex === 'F') {
      if (scr <= 0.7) {
        ckdEpi = 144 * Math.pow(scr/0.7, -0.329) * Math.pow(0.993, ageNum);
      } else {
        ckdEpi = 144 * Math.pow(scr/0.7, -1.209) * Math.pow(0.993, ageNum);
      }
    } else {
      if (scr <= 0.9) {
        ckdEpi = 141 * Math.pow(scr/0.9, -0.411) * Math.pow(0.993, ageNum);
      } else {
        ckdEpi = 141 * Math.pow(scr/0.9, -1.209) * Math.pow(0.993, ageNum);
      }
    }

    setResults({
      cockcroftGault: cockcroftGault.toFixed(1),
      mdrd: mdrd.toFixed(1),
      ckdEpi: ckdEpi.toFixed(1)
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    if (formData.weight && formData.height) {
      const newBmi = calculateBMI(formData.weight, formData.height);
      const newBsa = calculateBSA(formData.weight, formData.height);
      setBmi(newBmi);
      setBsa(newBsa);
    }
  }, [formData.weight, formData.height]);

  return (
    <Card className="w-full max-w-4xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          Calculateur de Fonction Rénale
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Âge (années)</Label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className={errors.age ? 'border-red-500' : ''}
              />
              {errors.age && <span className="text-sm text-red-500">{errors.age}</span>}
            </div>

            <div className="grid gap-2">
              <Label>Poids (kg)</Label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className={errors.weight ? 'border-red-500' : ''}
              />
              {errors.weight && <span className="text-sm text-red-500">{errors.weight}</span>}
            </div>

            <div className="grid gap-2">
              <Label>Taille (cm)</Label>
              <Input
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                className={errors.height ? 'border-red-500' : ''}
              />
              {errors.height && <span className="text-sm text-red-500">{errors.height}</span>}
            </div>

            <div className="grid gap-2">
              <Label>Créatinine (µmol/L)</Label>
              <Input
                type="number"
                value={formData.creatinine}
                onChange={(e) => handleInputChange('creatinine', e.target.value)}
                className={errors.creatinine ? 'border-red-500' : ''}
              />
              {errors.creatinine && <span className="text-sm text-red-500">{errors.creatinine}</span>}
            </div>

            <div className="grid gap-2">
              <Label>Sexe</Label>
              <Select
                value={formData.sex}
                onValueChange={(value) => handleInputChange('sex', value)}
              >
                <SelectTrigger className={errors.sex ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionnez le sexe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Homme</SelectItem>
                  <SelectItem value="F">Femme</SelectItem>
                </SelectContent>
              </Select>
              {errors.sex && <span className="text-sm text-red-500">{errors.sex}</span>}
            </div>

            <Button 
              onClick={calculate}
              className="w-full mt-4"
            >
              Calculer
            </Button>
          </div>

          <div className="space-y-4">
            {Object.entries(results).map(([key, value]) => (
              value && (
                <div key={key} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium capitalize">
                    {key === 'cockcroftGault' ? 'Cockcroft-Gault' :
                     key === 'mdrd' ? 'MDRD' :
                     'CKD-EPI'}
                  </h3>
                  <p className="text-2xl">{value} mL/min/1.73m²</p>
                </div>
              )
            ))}

            {bmi && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">IMC</h3>
                <p className="text-2xl">{bmi} kg/m²</p>
              </div>
            )}

            {bsa && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">Surface corporelle</h3>
                <p className="text-2xl">{bsa} m²</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RenalCalculator;