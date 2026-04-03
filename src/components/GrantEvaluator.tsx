import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { evaluateGrant } from '../services/agentService';
import { FileCheck, Loader2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function GrantEvaluator() {
  const { grants, evaluations, addEvaluation } = useAppContext();
  const [selectedGrantId, setSelectedGrantId] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const selectedGrant = grants.find(g => g.id === selectedGrantId);
  const evaluation = selectedGrantId ? evaluations[selectedGrantId] : null;

  const handleEvaluate = async () => {
    if (!selectedGrant) return;
    setIsEvaluating(true);
    try {
      const evalData = await evaluateGrant(selectedGrant);
      addEvaluation(evalData);
    } catch (err) {
      console.error(err);
      alert('Evaluation failed.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Grant Evaluator</h2>
        <p className="text-gray-500 mt-2">Success probability & fit analysis</p>
      </header>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a Grant to Evaluate</label>
        <div className="flex space-x-4">
          <select 
            className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
            value={selectedGrantId}
            onChange={(e) => setSelectedGrantId(e.target.value)}
          >
            <option value="">-- Select a Grant --</option>
            {grants.map(g => (
              <option key={g.id} value={g.id}>{g.name} ({g.region})</option>
            ))}
          </select>
          <button
            onClick={handleEvaluate}
            disabled={!selectedGrantId || isEvaluating}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isEvaluating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileCheck className="w-5 h-5" />}
            <span>Evaluate</span>
          </button>
        </div>
      </div>

      {evaluation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Evaluation Justification</h3>
              <p className="text-gray-700 leading-relaxed">{evaluation.justification}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" /> Risks
                </h4>
                <ul className="space-y-2">
                  {evaluation.risks.map((risk, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start">
                      <span className="mr-2 text-amber-500">•</span> {risk}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" /> Recommendations
                </h4>
                <ul className="space-y-2">
                  {evaluation.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start">
                      <span className="mr-2 text-emerald-500">•</span> {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Overall Score</h3>
              <div className="mt-2 text-5xl font-extrabold text-indigo-600">{evaluation.overallScore}%</div>
              <div className={`mt-4 inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold ${
                evaluation.decision === 'Go' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {evaluation.decision === 'Go' ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <XCircle className="w-4 h-4 mr-1.5" />}
                {evaluation.decision} DECISION
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Score Breakdown</h3>
              <div className="space-y-4">
                <ScoreBar label="Eligibility Match" score={evaluation.eligibilityMatch} />
                <ScoreBar label="Thematic Fit" score={evaluation.thematicFit} />
                <ScoreBar label="Innovation Strength" score={evaluation.innovationStrength} />
                <ScoreBar label="Geographic Fit" score={evaluation.geographicFit} />
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <DetailRow label="TRL Alignment" value={evaluation.trlAlignment} />
                <DetailRow label="Consortium" value={evaluation.consortiumReqs} />
                <DetailRow label="Budget" value={evaluation.budgetFeasibility} />
                <DetailRow label="Admin Complexity" value={evaluation.adminComplexity} />
                <DetailRow label="Competition" value={evaluation.competitionLevel} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, score }: { label: string, score: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-medium mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-900">{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right max-w-[60%]">{value}</span>
    </div>
  );
}
