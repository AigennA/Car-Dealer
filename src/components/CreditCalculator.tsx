"use client";

import { useState } from "react";
import { calculateMonthlyPayment as calcPayment } from "@/lib/finance";

export default function CreditCalculator() {
  const [carPrice, setCarPrice] = useState<number>(250000);
  const [downPayment, setDownPayment] = useState<number>(50000);
  const [loanTerm, setLoanTerm] = useState<number>(60);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleCalculate = () => {
    const loanAmount = carPrice - downPayment;
    if (loanAmount <= 0) {
      alert("Kontantinsatsen måste vara mindre än bilens pris");
      return;
    }
    setMonthlyPayment(calcPayment(loanAmount, loanTerm));
    setShowResult(true);
  };

  return (
    <div className="bg-gradient-to-br from-primary to-[#0099CC] rounded-xl p-8 md:p-12 text-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4 text-center">Räkna på ditt billån</h2>
        <p className="text-center mb-8 opacity-90">
          Beräkna din månadskostnad snabbt och enkelt
        </p>

        <div className="bg-white/10 backdrop-blur rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Bilens pris (kr)</label>
            <input
              type="number"
              value={carPrice}
              onChange={(e) => setCarPrice(Number(e.target.value))}
              placeholder="250000"
              className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Kontantinsats (kr)</label>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              placeholder="50000"
              className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Lånetid (månader)</label>
            <select 
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="24" className="text-gray-900">24 månader</option>
              <option value="36" className="text-gray-900">36 månader</option>
              <option value="48" className="text-gray-900">48 månader</option>
              <option value="60" className="text-gray-900">60 månader</option>
              <option value="72" className="text-gray-900">72 månader</option>
              <option value="84" className="text-gray-900">84 månader</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleCalculate}
            className="w-full bg-white text-primary px-6 py-3 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Beräkna månadskostnad
          </button>

          {showResult && monthlyPayment !== null && (
            <div className="mt-6 bg-white/20 backdrop-blur rounded-lg p-6 text-center">
              <p className="text-sm mb-2 opacity-90">Din beräknade månadskostnad</p>
              <p className="text-4xl font-bold mb-2">
                {monthlyPayment.toLocaleString("sv-SE")} kr
              </p>
              <p className="text-sm opacity-75">per månad i {loanTerm} månader</p>
              <div className="mt-4 pt-4 border-t border-white/20 text-left space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-75">Totalt att låna:</span>
                  <span className="font-medium">{(carPrice - downPayment).toLocaleString("sv-SE")} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Total kostnad:</span>
                  <span className="font-medium">{(monthlyPayment * loanTerm).toLocaleString("sv-SE")} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Ränta (3,95% årsränta):</span>
                  <span className="font-medium">{(monthlyPayment * loanTerm - (carPrice - downPayment)).toLocaleString("sv-SE")} kr</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm mt-6 opacity-75">
          * Detta är endast en indikativ beräkning med 3,95% årsränta. Exakt pris och villkor fastställs vid ansökan.
        </p>
      </div>
    </div>
  );
}
