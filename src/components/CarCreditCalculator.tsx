"use client";

import { useState } from "react";

interface CarCreditCalculatorProps {
  carPrice: number;
}

export default function CarCreditCalculator({ carPrice }: CarCreditCalculatorProps) {
  const [downPayment, setDownPayment] = useState<number>(Math.round(carPrice * 0.2));
  const [loanTerm, setLoanTerm] = useState<number>(60);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const calculateMonthlyPayment = () => {
    // Interest rate (example: 3.95% annual)
    const annualRate = 0.0395;
    const monthlyRate = annualRate / 12;
    
    // Loan amount
    const loanAmount = carPrice - downPayment;
    
    if (loanAmount <= 0) {
      alert("Kontantinsatsen måste vara mindre än bilens pris");
      return;
    }
    
    // Calculate monthly payment using the formula for annuity loans
    const monthlyPaymentCalc = 
      loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
      (Math.pow(1 + monthlyRate, loanTerm) - 1);
    
    setMonthlyPayment(Math.round(monthlyPaymentCalc));
    setShowResult(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-navy mb-4">Beräkna finansiering</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bilens pris
          </label>
          <div className="text-lg font-bold text-navy">
            {carPrice.toLocaleString("sv-SE")} kr
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kontantinsats (kr)
          </label>
          <input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lånetid
          </label>
          <select 
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="24">24 månader</option>
            <option value="36">36 månader</option>
            <option value="48">48 månader</option>
            <option value="60">60 månader</option>
            <option value="72">72 månader</option>
            <option value="84">84 månader</option>
          </select>
        </div>

        <button
          type="button"
          onClick={calculateMonthlyPayment}
          className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition font-medium"
        >
          Beräkna månadskostnad
        </button>

        {showResult && monthlyPayment !== null && (
          <div className="mt-4 bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Beräknad månadskostnad</p>
              <p className="text-3xl font-bold text-primary mb-1">
                {monthlyPayment.toLocaleString("sv-SE")} kr
              </p>
              <p className="text-sm text-gray-600">per månad i {loanTerm} månader</p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Totalt att låna:</span>
                <span className="font-medium text-navy">{(carPrice - downPayment).toLocaleString("sv-SE")} kr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total kostnad:</span>
                <span className="font-medium text-navy">{(monthlyPayment * loanTerm).toLocaleString("sv-SE")} kr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Räntekostnad:</span>
                <span className="font-medium text-navy">{(monthlyPayment * loanTerm - (carPrice - downPayment)).toLocaleString("sv-SE")} kr</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        * Beräkning med 3,95% årsränta. Exakta villkor fastställs vid ansökan.
      </p>
    </div>
  );
}
