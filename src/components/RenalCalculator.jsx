
import React, { useState, useEffect } from 'react';
// ...existing code...

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
  // États
  const [formData, setFormData] = useState(defaultFormState);
  const [results, setResults] = useState(defaultResultsState);
  const [bmi, setBmi] = useState(null);
  const [bsa, setBsa] = useState(null);
  const [errors, setErrors] = useState({});
  const [recommendations, setRecommendations] = useState([]);

  // Fonctions utilitaires
  const getFormulaRecommendation = (method, params) => {
    const { age, bmi, value } = params;
    
    // Par défaut, pas de recommandation spécifique
    let recommendation = {
      recommended: false,
      reason: ""
    };

    // Patient âgé (>65 ans)
    if (age > 65) {
      if (method === 'cockcroftGault') {
        return {
          recommended: true,
          reason: "Recommandée pour les patients âgés (approche plus prudente)"
        };
      }
    }

    // Patient obèse (BMI > 30)
    if (bmi > 30) {
      if (method === 'ckdEpi') {
        return {
          recommended: true,
          reason: "Recommandée pour les patients en surpoids (avec correction SC)"
        };
      }
    }

    // DFG > 60 mL/min/1.73m²
    if (value > 60) {
      if (method === 'ckdEpi') {
        return {
          recommended: true,
          reason: "Plus précise pour les DFG > 60 mL/min/1.73m²"
        };
      }
    }

    // Par défaut pour les autres cas
    if (method === 'ckdEpi' && !recommendation.recommended) {
      return {
        recommended: true,
        reason: "Recommandation générale actuelle"
      };
    }

    return recommendation;
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

  const generateRecommendations = () => {
    const newRecommendations = [];
    const age = parseInt(formData.age);
    const bmiValue = parseFloat(bmi);
    
    // Recommendations de base
    newRecommendations.push({
      title: "Recommandation générale",
      content: "La formule CKD-EPI est actuellement considérée comme la meilleure disponible, avec correction pour la surface corporelle réelle.",
      priority: "normale"
    });

    // Patients âgés (>65 ans)
    if (age > 65) {
      newRecommendations.push({
        title: "Patient âgé",
        content: "Pour les patients âgés, CKD-EPI reste performante mais certains cliniciens préfèrent Cockcroft-Gault pour une approche plus prudente.",
        priority: "haute"
      });
    }

    // Patients obèses (BMI > 30)
    if (bmiValue > 30) {
      newRecommendations.push({
        title: "Patient en surpoids",
        content: "Utiliser CKD-EPI avec correction pour la surface corporelle réelle. Attention aux recommandations spécifiques pour certains médicaments.",
        priority: "haute"
      });
    }

    setRecommendations(newRecommendations);
  };

  const getStageAndColor = (value) => {
    const val = parseFloat(value);
    if (val >= 90) return { stage: "Stade 1", color: "text-green-600" };
    if (val >= 60) return { stage: "Stade 2", color: "text-yellow-600" };
    if (val >= 30) return { stage: "Stade 3", color: "text-orange-500" };
    if (val >= 15) return { stage: "Stade 4", color: "text-red-500" };
    return { stage: "Stade 5", color: "text-red-700" };
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
    const scr = creatinineNum / 88.4; // Conversion en mg/dL
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

    // Correction pour surface corporelle si disponible
    if (bsa) {
      const correctionFactor = bsa / 1.73;
      const mdrdCorrected = mdrd * correctionFactor;
      const ckdEpiCorrected = ckdEpi * correctionFactor;

      setResults({
        cockcroftGault: cockcroftGault.toFixed(1),
        mdrd: mdrdCorrected.toFixed(1),
        ckdEpi: ckdEpiCorrected.toFixed(1)
      });
    } else {
      setResults({
        cockcroftGault: cockcroftGault.toFixed(1),
        mdrd: mdrd.toFixed(1),
        ckdEpi: ckdEpi.toFixed(1)
      });
    }

    generateRecommendations();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Effet pour calculer BMI et BSA
  useEffect(() => {
    if (formData.weight && formData.height) {
      const newBmi = calculateBMI(formData.weight, formData.height);
      const newBsa = calculateBSA(formData.weight, formData.height);
      setBmi(newBmi);
      setBsa(newBsa);
    }
  }, [formData.weight, formData.height]);

  // ...existing code...
};

export default RenalCalculator;