// 'use client';

// import { useState } from 'react';
// import { Play, Globe, CheckCircle2, Clock, Loader2, AlertCircle, Settings } from 'lucide-react';
// import AutomationConfig from '../components/AutomationConfig';
// import StepProgress from '../components/StepProgress';

// interface AutomationStep {
//   id: string;
//   title: string;
//   description: string;
//   status: 'pending' | 'running' | 'completed' | 'error';
//   error?: string;
// }

// interface AutomationStatus {
//   isRunning: boolean;
//   currentStepId: string;
//   steps: AutomationStep[];
//   error?: string;
// }

// export default function HomePage() {
//   const [config, setConfig] = useState({
//     username: '',
//     password: '',
//     googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1OV7SEibZqmBvvJ0HhSJW7yZrI04JL8VIOMTAr3t2Vqs/edit?usp=sharing',
//   });
//   const [status, setStatus] = useState<AutomationStatus>({
//     isRunning: false,
//     currentStepId: '',
//     steps: [
//       {
//         id: 'initialize',
//         title: 'Initialize Browser',
//         description: 'Starting Chrome browser and preparing automation',
//         status: 'pending'
//       },
//       {
//         id: 'navigate',
//         title: 'Navigate to Providence',
//         description: 'Opening https://providence.gobolt.com/login',
//         status: 'pending'
//       },
//       {
//         id: 'login',
//         title: 'Login to Providence',
//         description: 'Entering credentials and logging in',
//         status: 'pending'
//       },
//       {
//         id: 'facility',
//         title: 'Select Facility',
//         description: 'Selecting YYZ5 from facility dropdown',
//         status: 'pending'
//       },
//       {
//         id: 'inventory',
//         title: 'Navigate to Inventory Management',
//         description: 'Clicking on Inventory Management tab',
//         status: 'pending'
//       },
//       {
//         id: 'manual-items',
//         title: 'Open Manual Items',
//         description: 'Clicking on Manual Items section',
//         status: 'pending'
//       },
//       {
//         id: 'read-sheet',
//         title: 'Read Google Sheet',
//         description: 'Fetching BoltYYZ3 orders from Google Sheet',
//         status: 'pending'
//       },
//       {
//         id: 'process-orders',
//         title: 'Process Orders',
//         description: 'Searching orders and updating locations',
//         status: 'pending'
//       },
//       {
//         id: 'complete',
//         title: 'Automation Complete',
//         description: 'All steps completed successfully',
//         status: 'pending'
//       }
//     ]
//   });
//   const [showConfig, setShowConfig] = useState(false);
//   const [results, setResults] = useState<any[]>([]);

//   const startAutomation = async () => {
//     if (!config.username || !config.password || !config.googleSheetUrl) {
//       alert('Please configure your Providence credentials and Google Sheet URL first');
//       return;
//     }

//     setStatus(prev => ({
//       ...prev,
//       isRunning: true,
//       currentStepId: 'initialize',
//       steps: prev.steps.map(step => ({ ...step, status: 'pending' as const }))
//     }));

//     try {
//       const response = await fetch('/api/providence-automation', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(config),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const reader = response.body?.getReader();
//       if (!reader) throw new Error('No reader available');

//       const decoder = new TextDecoder();
//       let buffer = '';

//       while (true) {
//         const { done, value } = await reader.read();
        
//         if (done) break;
        
//         buffer += decoder.decode(value, { stream: true });
//         const lines = buffer.split('\n');
//         buffer = lines.pop() || '';

//         for (const line of lines) {
//           if (line.startsWith('data: ')) {
//             try {
//               const data = JSON.parse(line.slice(6));
//               setStatus(prevStatus => ({
//                 ...prevStatus,
//                 ...data,
//               }));
//               if (data.results) {
//                 setResults(data.results);
//               }
//             } catch (e) {
//               console.error('Error parsing SSE data:', e);
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Automation error:', error);
//       setStatus(prevStatus => ({
//         ...prevStatus,
//         isRunning: false,
//         error: error instanceof Error ? error.message : 'Unknown error occurred',
//       }));
//     }
//   };

//   const getOverallStatus = () => {
//     if (status.error) return { icon: AlertCircle, text: 'Error occurred', color: 'text-red-500' };
//     if (status.isRunning) return { icon: Loader2, text: 'Running automation...', color: 'text-blue-500' };
//     if (status.steps.every(step => step.status === 'completed')) return { icon: CheckCircle2, text: 'Automation completed', color: 'text-green-500' };
//     return { icon: Clock, text: 'Ready to start', color: 'text-slate-400' };
//   };

//   const overallStatus = getOverallStatus();
//   const StatusIcon = overallStatus.icon;

//   return (
//     <div className="min-h-screen p-6">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h1 className="text-4xl font-bold text-slate-900 mb-2">
//                 Providence Automation Tool
//               </h1>
//               <p className="text-lg text-slate-600">
//                 Automated login and facility selection for Providence portal
//               </p>
//             </div>
//             <button
//               onClick={() => setShowConfig(!showConfig)}
//               className="btn-secondary flex items-center gap-2"
//             >
//               <Settings className="h-4 w-4" />
//               Configuration
//             </button>
//           </div>
          
//           {/* Overall Status Bar */}
//           <div className="card p-4">
//             <div className="flex items-center gap-3">
//               <StatusIcon className={`h-6 w-6 ${overallStatus.color} ${status.isRunning ? 'animate-spin' : ''}`} />
//               <div>
//                 <div className="font-medium text-slate-900">{overallStatus.text}</div>
//                 {status.error && (
//                   <div className="text-sm text-red-600">{status.error}</div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Configuration Panel */}
//         {showConfig && (
//           <div className="mb-8">
//             <AutomationConfig config={config} onConfigChange={setConfig} />
//           </div>
//         )}

//         {/* Main Content */}
//         <div className="grid lg:grid-cols-2 gap-8">
//           {/* Control Panel */}
//           <div className="card p-6">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <Globe className="h-6 w-6 text-blue-600" />
//               </div>
//               <div>
//                 <h2 className="text-xl font-semibold text-slate-900">Automation Control</h2>
//                 <p className="text-slate-600">Start the Providence portal automation</p>
//               </div>
//             </div>
            
//             <div className="space-y-4">
//               <div className="p-4 bg-slate-50 rounded-lg">
//                 <h3 className="font-medium text-slate-900 mb-2">What this automation does:</h3>
//                 <ul className="text-sm text-slate-600 space-y-1">
//                   <li>• Opens Chrome browser in a new window</li>
//                   <li>• Navigates to Providence login page</li>
//                   <li>• Enters your credentials automatically</li>
//                   <li>• Selects YYZ5 facility from dropdown</li>
//                   <li>• Navigates to Manual Items section</li>
//                   <li>• Reads BoltYYZ3 orders from Google Sheet</li>
//                   <li>• Searches each order and updates locations</li>
//                 </ul>
//               </div>
              
//               <button
//                 onClick={startAutomation}
//                 disabled={status.isRunning || !config.username || !config.password || !config.googleSheetUrl}
//                 className={`w-full flex items-center justify-center gap-2 ${
//                   status.isRunning || !config.username || !config.password || !config.googleSheetUrl
//                     ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
//                     : 'btn-primary'
//                 } py-4`}
//               >
//                 {status.isRunning ? (
//                   <>
//                     <Loader2 className="h-5 w-5 animate-spin" />
//                     Running Automation...
//                   </>
//                 ) : (
//                   <>
//                     <Play className="h-5 w-5" />
//                     Start Providence Automation
//                   </>
//                 )}
//               </button>

//               {!config.username || !config.password || !config.googleSheetUrl ? (
//                 <p className="text-sm text-amber-600 text-center">
//                   Please configure your credentials and Google Sheet URL first
//                 </p>
//               ) : null}
//             </div>
//           </div>

//           {/* Step Progress */}
//           <div className="card p-6">
//             <h2 className="text-xl font-semibold text-slate-900 mb-4">Automation Progress</h2>
//             <StepProgress 
//               steps={status.steps} 
//               currentStepId={status.currentStepId}
//               isRunning={status.isRunning}
//             />
//           </div>
//         </div>

//         {/* Processing Results */}
//         {results.length > 0 && (
//           <div className="mt-8">
//             <div className="card p-6">
//               <h2 className="text-xl font-semibold text-slate-900 mb-4">Processing Results</h2>
//               <div className="space-y-3">
//                 {results.map((result, index) => (
//                   <div key={index} className="border border-slate-200 rounded-lg p-4">
//                     <div className="flex items-center justify-between mb-2">
//                       <div className="font-medium text-slate-900">
//                         Order: {result.orderNumber}
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         result.status === 'success' ? 'bg-green-100 text-green-800' :
//                         result.status === 'error' ? 'bg-red-100 text-red-800' :
//                         'bg-yellow-100 text-yellow-800'
//                       }`}>
//                         {result.status}
//                       </span>
//                     </div>
//                     {result.location && (
//                       <div className="text-sm text-slate-600">
//                         Location: <span className="font-medium">{result.location}</span>
//                       </div>
//                     )}
//                     {result.message && (
//                       <div className="text-sm text-slate-500 mt-1">
//                         {result.message}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Browser Window Indicator */}
//         {status.isRunning && (
//           <div className="mt-8 card p-6">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="p-2 bg-green-100 rounded-lg">
//                 <Globe className="h-6 w-6 text-green-600" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-slate-900">Browser Window Active</h3>
//                 <p className="text-slate-600">
//                   A Chrome browser window has been opened to perform the automation. 
//                   You can watch the process in real-time.
//                 </p>
//               </div>
//             </div>
            
//             <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//               <div className="flex items-start gap-3">
//                 <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 animate-pulse"></div>
//                 <div className="text-sm text-blue-800">
//                   <strong>Live Browser Session:</strong> The automation is running in a visible Chrome window. 
//                   You can observe each step as it happens, but please don't interact with the browser window 
//                   to avoid interrupting the automation process.
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


'use client';

import { useState, useEffect } from 'react';
import { Play, Settings, CheckCircle2, AlertCircle, Loader2, Database } from 'lucide-react';
import AutomationConfig from '@/src/components/AutomationConfig';
import StepProgress from '@/src/components/StepProgress';

interface AutomationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  error?: string;
}

interface ProcessingResult {
  orderNumber: string;
  status: string;
  message?: string;
  location?: string;
}

export default function ProvidenceAutomation() {
  const [isRunning, setIsRunning] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    username: '',
    password: '',
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1OV7SEibZqmBvvJ0HhSJW7yZrI04JL8VIOMTAr3t2Vqs/edit?usp=sharing'
  });
  const [steps, setSteps] = useState<AutomationStep[]>([]);
  const [currentStepId, setCurrentStepId] = useState('');
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [error, setError] = useState('');

  const startAutomation = async () => {
    if (!config.username || !config.password || !config.googleSheetUrl) {
      alert('Please configure your credentials first');
      setShowConfig(true);
      return;
    }

    setIsRunning(true);
    setError('');
    setResults([]);
    setSteps([]);

    try {
      const response = await fetch('/api/providence-automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: config.username,
          password: config.password,
          googleSheetUrl: config.googleSheetUrl
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              setSteps(data.steps || []);
              setCurrentStepId(data.currentStepId || '');
              setResults(data.results || []);
              setIsRunning(data.isRunning ?? true);
              
              if (data.error) {
                setError(data.error);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Automation error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  const handleConfigChange = (newConfig: any) => {
    setConfig(newConfig);
    setShowConfig(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Providence Order Automation
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Automated order processing from Google Sheets to Providence portal. 
            Fetches BoltYYZ3 orders and processes them through the Providence system.
          </p>
        </div>

        {/* Configuration */}
        {showConfig && (
          <div className="mb-6">
            <AutomationConfig 
              config={config} 
              onConfigChange={handleConfigChange}
            />
          </div>
        )}

        {/* Control Panel */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Automation Control</h2>
              <p className="text-slate-600">
                {config.username ? `Ready to run as ${config.username}` : 'Configure credentials to start'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="btn-secondary flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configure
              </button>
              
              <button
                onClick={startAutomation}
                disabled={isRunning || !config.username || !config.password}
                className="btn-primary flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Automation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="card p-6 mb-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-medium text-red-900">Automation Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        {steps.length > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Automation Progress</h2>
            <StepProgress 
              steps={steps} 
              currentStepId={currentStepId} 
              isRunning={isRunning} 
            />
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Processing Results ({results.length})
            </h2>
            
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900">Order #{result.orderNumber}</div>
                    {result.message && (
                      <div className="text-sm text-slate-600">{result.message}</div>
                    )}
                    {result.location && (
                      <div className="text-sm text-blue-600">Location: {result.location}</div>
                    )}
                  </div>
                  <span className={`status-badge ${
                    result.status === 'success' ? 'status-success' :
                    result.status === 'error' ? 'status-error' :
                    result.status === 'processing' ? 'status-processing' :
                    'status-pending'
                  }`}>
                    {result.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Console Output:</strong> Check your browser's developer console (F12) to see detailed terminal-style output of all processed orders.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}