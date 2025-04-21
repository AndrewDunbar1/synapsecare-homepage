"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Database, AlertCircle, Loader2, CheckCircle2, FileJson, UserCheck, UserX } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

// API Configuration
const API_BASE_URL = 'http://localhost:8000'; 

// Utility function for API calls
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API request failed: ${response.status}`);
  }

  return response.json();
}

// API functions for trial matching
async function getAvailableTrials() {
  try {
    const data = await fetchAPI('/trials');
    console.log('Available trials:', data.trials);
    return data.trials;
  } catch (error) {
    console.error('Error fetching trials:', error);
    throw error;
  }
}

// Run matching for a specific trial
async function runTrialMatching(trialId: string, patientsDir?: string) {
  try {
    console.log(`Starting matching process for trial: ${trialId} using patients dir: ${patientsDir || 'default'}`);
    
    // Construct the request body
    const requestBody: { trial_id: string; patients_dir?: string } = { 
      trial_id: trialId 
    };
    if (patientsDir) {
      requestBody.patients_dir = patientsDir;
    }
    
    const data = await fetchAPI('/match/trial', {
      method: 'POST',
      body: JSON.stringify(requestBody) // Send the body
    });
    console.log('Matching completed (initial response):', data);
    return data;
  } catch (error) {
    console.error('Error running trial matching:', error);
    throw error;
  }
}

// Run matching with a trial JSON object
async function runTrialMatchingWithJson(trialJson: any) {
  try {
    console.log('Starting matching process with trial JSON');
    const data = await fetchAPI('/match/trial_json', {
      method: 'POST',
      body: JSON.stringify(trialJson)
    });
    console.log('Matching completed:', data);
    return data;
  } catch (error) {
    console.error('Error running trial matching with JSON:', error);
    throw error;
  }
}

// Get results for a trial
async function getTrialResults(trialId: string) {
  try {
    const data = await fetchAPI(`/results/${trialId}`);
    console.log('Trial results:', data);
    return data;
  } catch (error) {
    console.error('Error fetching trial results:', error);
    throw error;
  }
}

// Polling constants
const POLLING_ATTEMPTS = 15; // Try polling 15 times
const POLLING_INTERVAL_MS = 8000; // Wait 8 seconds between attempts (adjust as needed)

// Polling function for results
async function pollForTrialResults(trialId: string, attempts: number = POLLING_ATTEMPTS, interval: number = POLLING_INTERVAL_MS): Promise<MatchResults> {
  console.log(`Starting polling for results: ${trialId}`);
  for (let i = 0; i < attempts; i++) {
    try {
      console.log(`Polling attempt ${i + 1}/${attempts} for ${trialId}...`);
      // Use the existing getTrialResults which calls GET /results/{trialId}
      const resultsData = await getTrialResults(trialId);
      console.log("Polling successful, results received:", resultsData);
      return resultsData; // Success!
    } catch (error: any) {
      // Check if the error is specifically a 404 Not Found
      // Note: fetchAPI throws an error, we need to check the message or status if possible.
      // Assuming fetchAPI throws an error with a message containing the status code for simplicity.
      if (error.message && error.message.includes("404")) {
        console.log(`Results for ${trialId} not ready yet (404). Waiting ${interval}ms...`);
        if (i === attempts - 1) {
          // Last attempt failed
          throw new Error(`Results for ${trialId} not available after ${attempts} attempts (404).`);
        }
        await new Promise(resolve => setTimeout(resolve, interval));
      } else {
        // Different error (e.g., 500, network error)
        console.error("Polling error:", error);
        throw new Error(`Polling failed for ${trialId}: ${error.message}`);
      }
    }
  }
  // Should not be reached if logic is correct, but added for type safety
  throw new Error(`Results for ${trialId} not available after ${attempts} attempts.`);
}

// Type definitions
interface Trial {
  nct_id: string;
  title: string;
}

interface TrialDetails {
  id: string;
  title: string;
  isFile?: boolean;
}

interface Patient {
  patient_id: string;
  score?: number;
  eligible?: boolean;
  priority_factor?: string | number;
  distance?: number;
  criteria_summary?: {
    total: number;
    met: number;
    not_met: number;
    unsure: number;
  };
  rejection_reasons?: string[];
  eligibility_details?: {
    met: Array<{criterion: string, reasoning: string}>;
    not_met: Array<{criterion: string, reasoning: string}>;
    unsure: Array<{criterion: string, reasoning: string}>;
  };
}

interface MatchResults {
  summary: {
    total_matching_patients: number;
    total_evaluated: number;
  };
  matching_patients: Patient[];
  non_matching_patients: Patient[];
  title?: string;
  trial_id?: string;
}

// Separate PatientCard component to fix the React hooks issue
function PatientCard({ patient, rank }: { patient: Patient; rank?: number }) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Handle potentially missing data with fallbacks
  const patientId = patient.patient_id || 'Unknown';
  const score = typeof patient.score === 'number' ? patient.score : 0;
  const isEligible = !!patient.eligible;
  const criteria = patient.criteria_summary || { total: 0, met: 0, not_met: 0, unsure: 0 };
  const totalCriteria = criteria.total || 1; // Avoid division by zero
  
  // Calculate percentages for the progress bar
  const metPercent = (criteria.met / totalCriteria) * 100;
  const unsurePercent = (criteria.unsure / totalCriteria) * 100;
  const notMetPercent = (criteria.not_met / totalCriteria) * 100;
  
  return (
    <div className="bg-gradient-to-br from-black/90 to-teal-950/20 border border-teal-500/20 rounded-lg overflow-hidden hover:border-teal-500/40 transition-all">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h4 className="text-white font-medium">
            {rank && <span className="text-teal-400 mr-1">{rank}.</span>}
            {patientId}
          </h4>
          <Badge className={`${isEligible ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
            {score.toFixed(0)}%
          </Badge>
        </div>
        
        {/* Criteria progress bar */}
        <div className="mt-2 mb-3">
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden flex">
            {metPercent > 0 && <div className="h-full bg-teal-500" style={{ width: `${metPercent}%` }}></div>}
            {unsurePercent > 0 && <div className="h-full bg-yellow-500" style={{ width: `${unsurePercent}%` }}></div>}
            {notMetPercent > 0 && <div className="h-full bg-red-500" style={{ width: `${notMetPercent}%` }}></div>}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Met: {criteria.met}/{totalCriteria}</span>
            <span>Not Met: {criteria.not_met}/{totalCriteria}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-400">Status:</span>
            <span className={`ml-1 font-medium ${isEligible ? 'text-teal-400' : 'text-red-400'}`}>
              {isEligible ? 'Eligible' : 'Not Eligible'}
            </span>
          </div>
          
          <div>
            <span className="text-gray-400">Distance:</span>
            <span className="ml-1 text-white">
              {patient.distance ? `${patient.distance.toFixed(1)} km` : 'N/A'}
            </span>
          </div>
          
          <div>
            <span className="text-gray-400">Priority:</span>
            <span className="ml-1 text-white">
              {patient.priority_factor || 'N/A'}
            </span>
          </div>
        </div>
        
        {/* Rejection reasons if any */}
        {patient.rejection_reasons && patient.rejection_reasons.length > 0 && (
          <div className="mt-3 text-sm">
            <h5 className="text-red-400 font-medium mb-1">Rejection Reasons:</h5>
            <ul className="list-disc list-inside text-red-400/80 space-y-1">
              {patient.rejection_reasons.map((reason, idx) => (
                <li key={`${patientId}-rejection-${idx}`} className="text-xs">{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Show details button (only if eligibility details exist) */}
      {patient.eligibility_details && (
        <>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-teal-300 hover:text-teal-200 hover:bg-teal-900/30 rounded-none border-t border-teal-900/50"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Eligibility Details'}
          </Button>
          
          {showDetails && (
            <div className="p-4 bg-black/40 border-t border-teal-900/50 text-sm space-y-3">
              {/* Met Criteria */}
              {patient.eligibility_details.met && patient.eligibility_details.met.length > 0 && (
                <div>
                  <h5 className="font-medium text-teal-400 mb-1">✅ Met Criteria:</h5>
                  <ul className="space-y-1 pl-3 text-gray-300 text-xs">
                    {patient.eligibility_details.met.map((item, idx) => (
                      <li key={`${patientId}-met-${idx}-${item.criterion.substring(0, 10)}`}>
                        <strong>{item.criterion}:</strong> {item.reasoning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Not Met Criteria */}
              {patient.eligibility_details.not_met && patient.eligibility_details.not_met.length > 0 && (
                <div>
                  <h5 className="font-medium text-red-400 mb-1">❌ Not Met Criteria:</h5>
                  <ul className="space-y-1 pl-3 text-gray-300 text-xs">
                    {patient.eligibility_details.not_met.map((item, idx) => (
                      <li key={`${patientId}-notmet-${idx}-${item.criterion.substring(0, 10)}`}>
                        <strong>{item.criterion}:</strong> {item.reasoning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Unsure Criteria */}
              {patient.eligibility_details.unsure && patient.eligibility_details.unsure.length > 0 && (
                <div>
                  <h5 className="font-medium text-yellow-400 mb-1">❓ Uncertain Criteria:</h5>
                  <ul className="space-y-1 pl-3 text-gray-300 text-xs">
                    {patient.eligibility_details.unsure.map((item, idx) => (
                      <li key={`${patientId}-unsure-${idx}-${item.criterion.substring(0, 10)}`}>
                        <strong>{item.criterion}:</strong> {item.reasoning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function TrialMatchingDemo() {
  const [activeStep, setActiveStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for API data
  const [trials, setTrials] = useState<Trial[]>([])
  const [isLoadingTrials, setIsLoadingTrials] = useState(true)
  const [selectedTrialId, setSelectedTrialId] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedTrialData, setUploadedTrialData] = useState<any | null>(null)
  const [currentTrialInfo, setCurrentTrialInfo] = useState<TrialDetails | null>(null)
  const [results, setResults] = useState<MatchResults | null>(null)

  // Fetch trials on component mount
  useEffect(() => {
    fetchTrialsList();
  }, []);

  const fetchTrialsList = async () => {
    setError(null);
    setIsLoadingTrials(true);
    
    try {
      const trialsData = await getAvailableTrials();
      
      // Define the Eli Lilly study we want to ensure is in the list
      const eliLillyStudy = {
        nct_id: 'NCT06238479',
        title: 'A Study of LY4101174 in Participants With Recurrent, Advanced or Metastatic Solid Tumors'
      };
      
      // Check if the Eli Lilly study is already in the list
      const studyExists = trialsData.some((trial: Trial) => trial.nct_id === eliLillyStudy.nct_id);
      
      // If not, add it to the list
      if (!studyExists) {
        console.log('Adding Eli Lilly study to trials list');
        trialsData.unshift(eliLillyStudy); // Add to the beginning of the array
      }
      
      setTrials(trialsData || []);
    } catch (err: any) {
      console.error('Error fetching trials:', err);
      setError(`Failed to connect to API: ${err.message}. Is the backend running at ${API_BASE_URL}?`);
      
      // If we can't fetch from the API, at least add the Eli Lilly study
      setTrials([{
        nct_id: 'NCT06238479',
        title: 'A Study of LY4101174 in Participants With Recurrent, Advanced or Metastatic Solid Tumors'
      }]);
    } finally {
      setIsLoadingTrials(false);
    }
  };

  const handleTrialSelectionChange = (value: string) => {
    setSelectedTrialId(value);
    setUploadedFile(null);
    setUploadedTrialData(null);
    setCurrentTrialInfo(null);
    setShowResults(false);
    setResults(null);
    setActiveStep(1);
    setError(null);
    setSuccessMessage(null);
    
    // Find selected trial details
    const selectedTrial = trials.find(t => t.nct_id === value);
    if (selectedTrial) {
      setCurrentTrialInfo({
        id: selectedTrial.nct_id,
        title: selectedTrial.title,
        isFile: false
      });
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMessage(null);
    
    const file = event.target.files?.[0];
    if (!file) {
      setUploadedFile(null);
      setUploadedTrialData(null);
      setCurrentTrialInfo(null);
      return;
    }
    
    if (file.type === "application/json") {
      setUploadedFile(file);
      setSelectedTrialId(null);
      setCurrentTrialInfo(null);
      setShowResults(false);
      setResults(null);
      setActiveStep(1);
      
      // Read and parse the file content
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as string;
        const trialData = JSON.parse(fileContent);
          setUploadedTrialData(trialData);

          // Validate required fields based on the README
          if (!trialData.nct_id) {
            console.warn("Uploaded JSON missing nct_id, which is recommended for best results");
        }

          // Set trial info from the parsed data
        setCurrentTrialInfo({
            id: trialData.nct_id || 'custom-trial',
            title: trialData.brief_title || trialData.official_title || file.name,
            isFile: true
        });
          
          setSuccessMessage("Trial JSON file successfully parsed.");
      } catch (err: any) {
          console.error('Error parsing JSON file:', err);
          setError(`Invalid JSON format: ${err.message}`);
          setUploadedFile(null);
          setUploadedTrialData(null);
        setCurrentTrialInfo(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
      }
    };
    
    reader.onerror = () => {
      setError("Failed to read the uploaded file.");
        setUploadedFile(null);
        setUploadedTrialData(null);
        setCurrentTrialInfo(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
      
      reader.readAsText(file);
    } else {
      setError("Please upload a valid JSON file. Other file formats are not supported.");
      setUploadedFile(null);
      setUploadedTrialData(null);
      setCurrentTrialInfo(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRunMatching = async () => {
    if (!currentTrialInfo) {
      setError("No trial selected or uploaded. Please select or upload a trial first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);
    setShowResults(false);
    setResults(null);

    const targetPatientsDir = "data/patients"; // Specify the target directory

    try {
      let trialIdForPolling: string | null = null;
      let initialMatchResponse: any = null;

      // Step 1: Initiate the matching process
      if (selectedTrialId) {
        console.log(`Initiating matching via POST /match/trial for: ${selectedTrialId} with dir: ${targetPatientsDir}`);
        initialMatchResponse = await runTrialMatching(selectedTrialId, targetPatientsDir);
        trialIdForPolling = selectedTrialId;
        console.log("Initial match response (POST /match/trial):", initialMatchResponse);
      } else if (uploadedTrialData) {
        if (uploadedTrialData.nct_id) {
          console.log(`Initiating matching via POST /match/trial for uploaded NCT ID: ${uploadedTrialData.nct_id} with dir: ${targetPatientsDir}`);
          initialMatchResponse = await runTrialMatching(uploadedTrialData.nct_id, targetPatientsDir);
          trialIdForPolling = uploadedTrialData.nct_id;
          console.log("Initial match response (POST /match/trial for upload):", initialMatchResponse);
        } else {
          // Case: Uploaded file without nct_id - Use POST /match/trial_json
          // Assuming /match/trial_json does *not* take patients_dir based on instructions
          console.log('Initiating matching via POST /match/trial_json');
          const matchData = await runTrialMatchingWithJson(uploadedTrialData);
          console.log("Match response (POST /match/trial_json):", matchData);
          if (matchData.matching_patients || matchData.non_matching_patients) {
            setResults(matchData);
            setShowResults(true);
            setSuccessMessage("Matching process completed successfully (from direct response)!");
            setActiveStep(3);
            setIsProcessing(false); // Finished for this specific case
            return; // Exit early, no polling needed/specified
          } else {
            // If /match/trial_json didn't return results directly and has no ID for polling
            throw new Error("Matching initiated via JSON upload, but no results returned directly and no ID available for polling.");
          }
        }
      } else {
        throw new Error("No trial selected or uploaded.");
      }

      // Step 2: Poll for results if we have a trialIdForPolling
      if (trialIdForPolling) {
        setSuccessMessage(`Matching initiated for ${trialIdForPolling}. Polling for results...`);
        const finalResults = await pollForTrialResults(trialIdForPolling);
        
        // Step 3: Display results
        setResults(finalResults);
        setShowResults(true);
        setSuccessMessage(`Matching results received for ${trialIdForPolling}!`);
        setActiveStep(3);
      } else {
        // This case should technically not be reached if logic above is correct
        // but handles the case where matching was initiated but no ID was set for polling.
        throw new Error("Matching initiated, but no trial ID was available to poll for results.");
      }

    } catch (err: any) {
      console.error('Error during matching or polling process:', err);
      setError(`Error: ${err.message}`);
      setResults(null);
      setShowResults(false);
      // Keep activeStep at 2 (or 1 if it failed before selection)
      // Allow user to retry or select a different trial
    } finally {
      // Only set isProcessing to false if it hasn't been set already (e.g., in the early return case)
      if (isProcessing) {
         setIsProcessing(false);
      }
    }
  };

  const handleTestPatientClick = async () => {
    const testTrialId = 'NCT06238479'; // Eli Lilly trial ID (verified on ClinicalTrials.gov)
    const testTrialTitle = "A Study of LY4101174 in Participants With Recurrent, Advanced or Metastatic Solid Tumors";
    const targetPatientsDir = "data/patients"; 

    console.log(`Initiating test patient matching for: ${testTrialId} with dir: ${targetPatientsDir}`);

    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);
    setShowResults(false);
    setResults(null);
    // Set currentTrialInfo with the verified title from ClinicalTrials.gov
    setCurrentTrialInfo({ id: testTrialId, title: testTrialTitle, isFile: false });
    setActiveStep(2); // Move to step 2 visually

    try {
      // Step 1: Initiate the matching process using the existing function
      console.log(`Initiating matching via POST /match/trial for test ID: ${testTrialId} with dir: ${targetPatientsDir}`);
      const initialMatchResponse = await runTrialMatching(testTrialId, targetPatientsDir); // Pass dir
      console.log("Initial match response (POST /match/trial for test):", initialMatchResponse);

      // Step 2: Poll for results using the existing polling function
      setSuccessMessage(`Test matching initiated for ${testTrialId} with dir ${targetPatientsDir}. Polling...`);
      const finalResults = await pollForTrialResults(testTrialId);
      
      // Step 3: Display results
      setResults(finalResults);
      setShowResults(true);
      setSuccessMessage(`Test matching results received for ${testTrialId} (from ${targetPatientsDir})!`);
      setActiveStep(3);

    } catch (err: any) {
      console.error('Error during test patient matching or polling process:', err);
      setError(`Error running test: ${err.message}`);
      setResults(null);
      setShowResults(false);
      // Reset active step if needed, or keep at step 2 to show the error context
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and description */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Trial-to-Patient Matching Demo</h2>
        <p className="text-gray-400 max-w-3xl mx-auto">
          This interactive demo shows how our AI system matches clinical trials to suitable patients.
          Select a trial from our database or upload your own trial definition to see how it works.
        </p>
        <div className="mt-4">
          <Button 
            onClick={handleTestPatientClick}
            disabled={isProcessing}
            variant="secondary" 
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
             {isProcessing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Running Test...</>
            ) : (
              <>Test Match with Solid Tumor Trial (NCT06238479)</>
             )}
          </Button>
        </div>
      </div>

      {/* Step 1: Select or Upload Trial */}
      <Card className="bg-gradient-to-br from-black to-teal-950/30 border border-teal-500/20 overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">
                <span className="bg-teal-900/50 text-teal-300 w-6 h-6 inline-flex items-center justify-center rounded-full mr-2 text-sm">1</span>
                Select or Upload Trial
              </CardTitle>
              <CardDescription className="text-gray-400">
                Choose from our database of trials or upload your own trial definition file
              </CardDescription>
            </div>
            {activeStep > 1 && (
              <Badge className="bg-teal-900/50 text-teal-300 border-teal-800"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>
            )}
        </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trial Selection */}
            <div className="space-y-2">
            <label htmlFor="trial-selector" className="text-sm font-medium text-gray-300">Select a Clinical Trial</label>
              <Select
              value={selectedTrialId || ""}
                onValueChange={handleTrialSelectionChange}
              disabled={isProcessing || isLoadingTrials}
              >
              <SelectTrigger id="trial-selector" className="w-full bg-black/30 border-teal-800/50 text-white">
                <SelectValue placeholder={isLoadingTrials ? "Loading trials..." : "Select a trial"} />
                </SelectTrigger>
              <SelectContent className="bg-black border-teal-900 text-white">
                {isLoadingTrials ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Loading trials...
                    </div>
                  </SelectItem>
                ) : trials.length === 0 ? (
                  <SelectItem value="none" disabled>No trials available</SelectItem>
                ) : (
                    trials.map((trial) => (
                    <SelectItem key={trial.nct_id} value={trial.nct_id} className="hover:bg-teal-900/30">
                        {trial.nct_id}: {trial.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          
          <div className="relative flex items-center justify-center">
            <hr className="w-full border-t border-teal-900/50" />
            <span className="px-2 bg-transparent text-gray-500 absolute">OR</span>
          </div>
          
          {/* Trial Upload */}
          <div className="space-y-2">
            <label htmlFor="trial-file" className="text-sm font-medium text-gray-300">Upload Trial JSON File</label>
            <div className="flex items-center">
              <Input 
                id="trial-file"
                ref={fileInputRef}
                type="file" 
                accept=".json"
                onChange={handleFileInputChange}
                disabled={isProcessing}
                className="flex-grow file:mr-3 file:py-1 file:px-3 file:border-0 file:text-sm file:font-medium file:bg-teal-900/30 file:text-teal-300 hover:file:bg-teal-900/50 text-gray-300 bg-black/30 border-teal-800/50"
              />
            </div>
            
            {uploadedFile && (
              <div className="flex items-center space-x-2 mt-1">
                <FileJson className="h-4 w-4 text-teal-400" />
                <span className="text-sm text-teal-200">{uploadedFile.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Trial Information */}
      {currentTrialInfo && (
        <Card className="bg-gradient-to-br from-black to-teal-950/30 border border-teal-500/20 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">
                  <span className="bg-teal-900/50 text-teal-300 w-6 h-6 inline-flex items-center justify-center rounded-full mr-2 text-sm">2</span>
                  Trial Information
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Review and run patient matching for this trial
                </CardDescription>
              </div>
              {activeStep > 2 && (
                <Badge className="bg-teal-900/50 text-teal-300 border-teal-800"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>
              )}
              </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-black/40 border border-teal-900/40 rounded-lg p-4">
              <h3 className="text-xl font-bold text-white mb-2">{currentTrialInfo.title}</h3>
              <p className="text-gray-300"><strong>Trial ID:</strong> {currentTrialInfo.id}</p>
              {currentTrialInfo.isFile && uploadedFile && (
                <p className="text-gray-500 text-sm mt-1">Source: Uploaded file ({uploadedFile.name})</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
          <Button
            onClick={handleRunMatching}
            disabled={isProcessing}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white"
          >
            {isProcessing ? (
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Patient Matching...
              </>
            ) : (
              <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Patient Matching
              </>
            )}
          </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="bg-red-900/30 border-red-600/30 text-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            {error && typeof error === 'string' && error.includes("API") && (
              <div className="mt-2 text-sm">
                <p>The backend API may not be running correctly. Ensure:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>The backend server is running at {API_BASE_URL}</li>
                  <li>There are no Python path issues in the backend</li>
                  <li>Check the backend logs for more details</li>
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-teal-900/30 border-teal-600/30 text-teal-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      
      {/* Step 3: Matching Results */}
      {showResults && results && (
        <Card className="bg-gradient-to-br from-black to-teal-950/30 border border-teal-500/20 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-white">
              <span className="bg-teal-900/50 text-teal-300 w-6 h-6 inline-flex items-center justify-center rounded-full mr-2 text-sm">3</span>
              Matching Results
            </CardTitle>
            <CardDescription className="text-gray-400">
              Patients matched to trial: {results.title || currentTrialInfo?.title || 'Unknown Trial'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="bg-teal-950/20 border border-teal-900/40 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-3">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="text-gray-400">Total Patients Evaluated:</div>
                <div className="text-white font-medium text-right">{results.summary?.total_evaluated || 0}</div>
                
                <div className="text-gray-400">Matching Patients:</div>
                <div className="text-white font-medium text-right">{results.summary?.total_matching_patients || 0}</div>
                
                <div className="text-gray-400">Match Rate:</div>
                <div className="text-white font-medium text-right">
                  {results.summary?.total_evaluated ? 
                    `${((results.summary.total_matching_patients / results.summary.total_evaluated) * 100).toFixed(1)}%` : 
                    'N/A'}
              </div>
            </div>
          </div>

            {/* Results Tabs */}
            <Tabs defaultValue="matching" className="w-full">
              <TabsList className="w-full bg-black/50 border border-teal-900/40 rounded-md">
                <TabsTrigger 
                  value="matching" 
                  className="flex-grow data-[state=active]:bg-teal-900/30 data-[state=active]:text-teal-300"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Matching Patients ({results.matching_patients?.length || 0})
                </TabsTrigger>
                <TabsTrigger 
                  value="non-matching" 
                  className="flex-grow data-[state=active]:bg-teal-900/30 data-[state=active]:text-teal-300"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Non-Matching Patients ({results.non_matching_patients?.length || 0})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="matching" className="pt-4">
                {(!results.matching_patients || results.matching_patients.length === 0) ? (
                  <div className="text-center py-8 text-gray-500">
                    No matching patients found for this trial
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.matching_patients.map((patient, index) => (
                      <PatientCard 
                        key={`matching-${patient.patient_id || ''}-${index}`}
                        patient={patient}
                        rank={index + 1}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="non-matching" className="pt-4">
                {(!results.non_matching_patients || results.non_matching_patients.length === 0) ? (
                  <div className="text-center py-8 text-gray-500">
                    No non-matching patients for this trial
            </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.non_matching_patients.map((patient, index) => (
                      <PatientCard 
                        key={`non-matching-${patient.patient_id || ''}-${index}`}
                        patient={patient}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      {/* API Reference */}
      <div className="mt-8 border border-teal-900/30 rounded-lg p-4 bg-black/40">
        <h3 className="text-white font-medium mb-2 flex items-center">
          <Database className="h-4 w-4 mr-2 text-teal-400" />
          API Configuration
        </h3>
        <p className="text-gray-400 text-sm">
          This demo is connecting to the Trial-to-Patient Matching API at: <code className="bg-black/70 px-2 py-0.5 rounded text-teal-300">{API_BASE_URL}</code>
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Make sure the backend API is running at this address. Visit <a href={`${API_BASE_URL}/docs`} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">API Documentation</a> for more details.
        </p>
              </div>
            </div>
  );
}