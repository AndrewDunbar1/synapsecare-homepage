"use client"

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define types for API data (adjust based on your actual API response)
interface Trial {
  nct_id: string;
  title: string;
  // Add other relevant fields if needed
}

interface MatchResults {
  summary?: {
    total_matching_patients?: number;
    total_evaluated?: number;
  };
  matching_patients?: any[]; // Define a proper patient type later
  non_matching_patients?: any[]; // Define a proper patient type later
  trial_id?: string;
  title?: string;
  // Add other relevant fields if needed
}

const API_BASE_URL = 'http://localhost:8000'; // Make sure this matches your backend

export default function DemoSection() {
  // --- State Variables ---
  const [trials, setTrials] = useState<Trial[]>([]);
  const [selectedTrialId, setSelectedTrialId] = useState<string | null>(null);
  const [uploadedTrialFile, setUploadedTrialFile] = useState<File | null>(null);
  const [uploadedTrialData, setUploadedTrialData] = useState<object | null>(null); // Store parsed JSON
  const [matchResults, setMatchResults] = useState<MatchResults | null>(null);
  const [currentTrialInfo, setCurrentTrialInfo] = useState<{ id: string | null, title: string | null, isFile: boolean }>({ id: null, title: null, isFile: false });

  const [isLoadingTrials, setIsLoadingTrials] = useState<boolean>(true);
  const [isLoadingResults, setIsLoadingResults] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Effects ---
  // Fetch trials on component mount
  useEffect(() => {
    const fetchTrials = async () => {
      setIsLoadingTrials(true);
      setError(null);
      try {
        console.log('Fetching trials list...');
        const response = await fetch(`${API_BASE_URL}/trials`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error (${response.status}): ${errorText}`);
          throw new Error(`Failed to fetch trials. Status: ${response.status}. Is the backend running at ${API_BASE_URL}?`);
        }

        const data = await response.json();
        console.log('Received trials:', data);

        if (data.trials && Array.isArray(data.trials)) {
          setTrials(data.trials);
        } else {
          console.warn('Trials data is not in the expected format:', data);
          setTrials([]);
          setError("Received unexpected trial data format from API.");
        }
      } catch (err: any) {
        console.error('Error fetching trials:', err);
        setError(err.message || 'An unknown error occurred while fetching trials.');
        setTrials([]); // Clear trials on error
      } finally {
        setIsLoadingTrials(false);
      }
    };

    fetchTrials();
  }, []); // Empty dependency array means this runs once on mount

  // --- Event Handlers (Implement functionality later) ---
  const handleTrialSelect = (value: string) => {
    setError(null);
    setMatchResults(null); // Clear old results
    setUploadedTrialFile(null); // Clear file upload
    setUploadedTrialData(null);
    setSelectedTrialId(value);
    const selectedTrial = trials.find(t => t.nct_id === value);
    setCurrentTrialInfo({ id: value, title: selectedTrial?.title || value, isFile: false });
    console.log("Selected Trial ID:", value);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setMatchResults(null); // Clear old results
    setSelectedTrialId(null); // Clear selection
    setCurrentTrialInfo({ id: null, title: null, isFile: false });

    const file = event.target.files?.[0];
    if (file) {
        if (file.type === "application/json") {
            setUploadedTrialFile(file);
            // Read and parse the file content
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonContent = JSON.parse(e.target?.result as string);
                    setUploadedTrialData(jsonContent);
                    // Optionally set current trial info based on file content
                     setCurrentTrialInfo({ id: jsonContent?.nct_id || 'Uploaded', title: jsonContent?.brief_title || file.name, isFile: true });
                    console.log("Uploaded and parsed Trial JSON:", jsonContent);
                } catch (parseError: any) {
                    console.error("Error parsing JSON file:", parseError);
                    setError(`Invalid JSON file: ${parseError.message}`);
                    setUploadedTrialFile(null);
                    setUploadedTrialData(null);
                }
            };
            reader.onerror = () => {
                console.error("Error reading file:", reader.error);
                setError("Could not read the selected file.");
                setUploadedTrialFile(null);
                 setUploadedTrialData(null);
            };
            reader.readAsText(file);
        } else {
            setError("Please upload a valid JSON file (.json).");
            setUploadedTrialFile(null);
             setUploadedTrialData(null);
            event.target.value = ''; // Clear the input
        }
    } else {
        setUploadedTrialFile(null);
        setUploadedTrialData(null);
    }
  };


  const handleRunMatching = async () => {
    if (!selectedTrialId && !uploadedTrialData) {
      setError("Please select a trial or upload a trial JSON file first.");
      return;
    }

    setIsLoadingResults(true);
    setError(null);
    setMatchResults(null); // Clear previous results

    try {
      let matchResponseData: any;
      let trialIdToFetch: string | null = null;

      if (selectedTrialId) {
        console.log(`Running matching for selected trial: ${selectedTrialId}`);
        trialIdToFetch = selectedTrialId;
        const matchResponse = await fetch(`${API_BASE_URL}/match/trial/${selectedTrialId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
           // Add body if required by API
        });
        if (!matchResponse.ok) {
           const errorText = await matchResponse.text();
          throw new Error(`Matching API Error (${matchResponse.status}): ${errorText || matchResponse.statusText}`);
        }
         matchResponseData = await matchResponse.json(); // Assuming POST returns some status/job ID
         console.log("Matching triggered:", matchResponseData)

      } else if (uploadedTrialData) {
        console.log("Running matching for uploaded trial file:", uploadedTrialFile?.name);
        // *** Assumption: Backend has an endpoint like /match/trial_json that accepts the JSON content ***
        // *** If your backend expects something different (like form-data upload), adjust this fetch call ***
        const matchResponse = await fetch(`${API_BASE_URL}/match/trial_json`, { // Adjust endpoint if needed
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uploadedTrialData),
        });

         if (!matchResponse.ok) {
          const errorText = await matchResponse.text();
          throw new Error(`Matching API Error (${matchResponse.status}): ${errorText || matchResponse.statusText}`);
        }
         matchResponseData = await matchResponse.json(); // Assuming POST returns some status/job ID
         // Get the trial ID from the response or the uploaded data to fetch results
         trialIdToFetch = (uploadedTrialData as any)?.nct_id || matchResponseData?.trial_id || null; // Adjust based on actual response
         console.log("Matching triggered for upload:", matchResponseData)
          if (!trialIdToFetch) {
            console.warn("Could not determine trial ID from uploaded file or match response to fetch results.");
            // Maybe display the response from POST directly if it contains results?
             // setMatchResults(matchResponseData); // Uncomment if POST returns full results
             // setIsLoadingResults(false); // Uncomment if POST returns full results
             // return; // Uncomment if POST returns full results
          }
      }

      // --- Fetch Results ---
      // The example app.js fetches results separately after triggering the match.
      // Adjust this logic if your '/match/...' endpoint directly returns the results.
      if (trialIdToFetch) {
           console.log(`Fetching results for trial: ${trialIdToFetch}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Optional delay to allow backend processing

          const resultsResponse = await fetch(`${API_BASE_URL}/results/${trialIdToFetch}`);
          if (!resultsResponse.ok) {
            const errorText = await resultsResponse.text();
            throw new Error(`Results API Error (${resultsResponse.status}): ${errorText || resultsResponse.statusText}`);
          }
          const resultsData: MatchResults = await resultsResponse.json();
           console.log("Received results:", resultsData);
          setMatchResults(resultsData);
      } else {
          // Handle case where we couldn't get a trial ID (e.g., if POST response didn't provide one for uploaded file)
          // If the POST response contained the results directly, we might have already set them.
          if (!matchResponseData || (!matchResponseData.matching_patients && !matchResponseData.non_matching_patients)) {
             setError("Matching process initiated, but couldn't retrieve results (no Trial ID found). Check backend logs.");
          } else {
             // Assuming matchResponseData contains the results if no trialIdToFetch
             console.log("Using results directly from match response:", matchResponseData);
             setMatchResults(matchResponseData);
          }
      }

    } catch (err: any) {
      console.error('Error during matching or fetching results:', err);
      setError(err.message || 'An unknown error occurred during the matching process.');
       setMatchResults(null); // Ensure results are cleared on error
    } finally {
      setIsLoadingResults(false);
    }
  };

  // --- Render Logic ---
  return (
    <div className="space-y-8">
      {/* --- 1. Select or Upload Trial --- */}
      <Card className="bg-gradient-to-br from-black to-teal-950/30 border border-teal-500/20 relative overflow-hidden">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><List className="h-5 w-5 text-teal-400" /> Select or Upload Trial</CardTitle>
          <CardDescription className="text-gray-400">Choose an existing trial from the list or upload your own trial definition file (JSON).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trial Selection Dropdown */}
          <div className="space-y-2">
            <label htmlFor="trial-select" className="text-sm font-medium text-gray-300">Select Existing Trial</label>
            <Select
              value={selectedTrialId || ""}
              onValueChange={handleTrialSelect}
              disabled={isLoadingTrials || isLoadingResults}
            >
              <SelectTrigger id="trial-select" className="w-full bg-black/30 border-teal-700/50 text-white">
                <SelectValue placeholder={isLoadingTrials ? "Loading trials..." : "Select a trial"} />
              </SelectTrigger>
              <SelectContent className="bg-black border-teal-700 text-white">
                {isLoadingTrials && <SelectItem value="loading" disabled>Loading...</SelectItem>}
                {!isLoadingTrials && trials.length === 0 && !error && <SelectItem value="no-trials" disabled>No trials available</SelectItem>}
                 {!isLoadingTrials && trials.length === 0 && error && <SelectItem value="load-error" disabled>Error loading trials</SelectItem>}
                {trials.map((trial) => (
                  <SelectItem key={trial.nct_id} value={trial.nct_id} className="hover:bg-teal-900/50 focus:bg-teal-900/50">
                    {trial.nct_id}: {trial.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4">
                <hr className="flex-grow border-t border-teal-800/50" />
                <span className="text-gray-400 text-sm">OR</span>
                <hr className="flex-grow border-t border-teal-800/50" />
           </div>


          {/* Trial File Upload */}
           <div className="space-y-2">
             <label htmlFor="trial-file" className="text-sm font-medium text-gray-300">Upload Trial JSON File</label>
             <div className="flex items-center gap-3">
                <Input
                    id="trial-file"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    disabled={isLoadingResults}
                    className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-800/30 file:text-teal-200 hover:file:bg-teal-800/50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 bg-black/30 border-teal-700/50"
                 />
                {uploadedTrialFile && <Badge variant="secondary">{uploadedTrialFile.name}</Badge>}
            </div>
           </div>
        </CardContent>
      </Card>

      {/* --- 2. Trial Information & Run Button --- */}
      {(selectedTrialId || uploadedTrialData) && (
        <Card className="bg-gradient-to-br from-black to-teal-950/30 border border-teal-500/20 relative overflow-hidden">
           <CardHeader>
             <CardTitle className="text-white">Selected Trial</CardTitle>
           </CardHeader>
           <CardContent>
                <p className="text-gray-300"><strong>ID:</strong> {currentTrialInfo.id || 'N/A'}</p>
                <p className="text-gray-300"><strong>Title:</strong> {currentTrialInfo.title || 'N/A'}</p>
                 {currentTrialInfo.isFile && uploadedTrialFile && <p className="text-sm text-gray-500">Source: {uploadedTrialFile.name}</p>}
           </CardContent>
           <CardFooter>
            <Button
                onClick={handleRunMatching}
                disabled={isLoadingResults || (!selectedTrialId && !uploadedTrialData)}
                className="w-full bg-teal-500 hover:bg-teal-400 text-black font-medium"
             >
                {isLoadingResults ? (
                    <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running Match... </>
                 ) : (
                    'Run Patient Matching'
                 )}
            </Button>
           </CardFooter>
         </Card>
       )}

      {/* --- Error Display --- */}
      {error && (
         <Alert variant="destructive" className="bg-red-900/30 border-red-500/50 text-red-300">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
       )}


      {/* --- 3. Matching Results --- */}
       {isLoadingResults && (
            <div className="flex justify-center items-center p-8 text-teal-300">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading Results...
            </div>
        )}

      {matchResults && !isLoadingResults && (
        <Card className="bg-gradient-to-br from-black to-teal-950/30 border border-teal-500/20 relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-white">Matching Results</CardTitle>
            {matchResults.title && <CardDescription className="text-gray-400">Results for: {matchResults.title} ({matchResults.trial_id || currentTrialInfo.id})</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="border border-teal-800/50 rounded-lg p-4 bg-teal-950/20">
                <h4 className="font-semibold text-lg text-white mb-2">Summary</h4>
                 <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                     <p>Matching Patients:</p><p className="text-right font-medium text-white">{matchResults.summary?.total_matching_patients ?? 'N/A'}</p>
                     <p>Total Patients Evaluated:</p><p className="text-right font-medium text-white">{matchResults.summary?.total_evaluated ?? 'N/A'}</p>
          </div>
        </div>

            {/* Matching Patients */}
            <div>
                <h4 className="font-semibold text-lg text-white mb-3">Matching Patients ({matchResults.matching_patients?.length ?? 0})</h4>
                <div className="space-y-4">
                 {(matchResults.matching_patients && matchResults.matching_patients.length > 0) ? (
                     matchResults.matching_patients.map((patient: any, index: number) => (
                         <PatientCard key={patient.patient_id || index} patient={patient} rank={index + 1} />
                     ))
                 ) : (
                     <p className="text-gray-500 italic">No matching patients found.</p>
                 )}
          </div>
            </div>

            {/* Non-Matching Patients */}
             <div>
                 <h4 className="font-semibold text-lg text-white mb-3">Non-Matching Patients ({matchResults.non_matching_patients?.length ?? 0})</h4>
                 <div className="space-y-4">
                 {(matchResults.non_matching_patients && matchResults.non_matching_patients.length > 0) ? (
                     matchResults.non_matching_patients.map((patient: any, index: number) => (
                         <PatientCard key={patient.patient_id || index} patient={patient} />
                     ))
                 ) : (
                     <p className="text-gray-500 italic">No non-matching patients found.</p>
                 )}
        </div>
      </div>
          </CardContent>
    </Card>
      )}
    </div>
  )
}


// --- Sub-component for Patient Card (Based on app.js logic) ---
// NOTE: This is a simplified version. Needs refinement based on actual patient data structure.
function PatientCard({ patient, rank }: { patient: any, rank?: number }) {
    const [showDetails, setShowDetails] = useState(false);

    // Safely access nested properties with fallbacks
    const patientId = patient?.patient_id ?? 'Unknown ID';
    const score = typeof patient?.score === 'number' ? patient.score : null;
    const criteriaSummary = patient?.criteria_summary ?? {};
    const totalCriteria = criteriaSummary.total ?? 1; // Avoid division by zero
    const met = criteriaSummary.met ?? 0;
    const notMet = criteriaSummary.not_met ?? 0;
    const unsure = criteriaSummary.unsure ?? 0;
    const isEligible = patient?.eligible ?? false;
    const distance = typeof patient?.distance === 'number' ? `${patient.distance.toFixed(1)} km` : 'N/A';
    const priorityFactor = patient?.priority_factor ?? 'N/A';
    const rejectionReasons = patient?.rejection_reasons ?? [];

    const metPercent = (met / totalCriteria) * 100;
    const unsurePercent = (unsure / totalCriteria) * 100;
    const notMetPercent = 100 - metPercent - unsurePercent; // Ensure it adds up

    const eligibilityDetails = patient?.eligibility_details; // Assume structure exists

          return (
    <Card className="bg-black/40 border border-teal-800/60 overflow-hidden">
        <CardHeader className="p-4">
            <div className="flex justify-between items-start gap-2">
                 <CardTitle className="text-base text-white">
                    {rank && <span className="text-teal-400 font-semibold mr-1">{rank}.</span>}
                    {patientId}
                </CardTitle>
                 {score !== null && (
                     <Badge className={`text-xs ${isEligible ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                         Score: {score.toFixed(0)}%
                     </Badge>
                 )}
            </div>
             {/* Criteria Progress Bar */}
             <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mt-2 flex">
                <div className="bg-teal-500 h-full" style={{ width: `${metPercent}%` }} title={`Met: ${met}`}></div>
                <div className="bg-yellow-500 h-full" style={{ width: `${unsurePercent}%` }} title={`Unsure: ${unsure}`}></div>
                <div className="bg-red-600 h-full" style={{ width: `${notMetPercent}%` }} title={`Not Met: ${notMet}`}></div>
            </div>
        </CardHeader>
        <CardContent className="p-4 text-sm space-y-2">
             <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-300">
                 <span>Eligibility:</span><span className={`font-medium text-right ${isEligible ? 'text-teal-300' : 'text-red-400'}`}>{isEligible ? 'Yes' : 'No'}</span>
                 <span>Criteria Met:</span><span className="font-medium text-right text-white">{met}/{totalCriteria}</span>
                 <span>Distance:</span><span className="font-medium text-right text-white">{distance}</span>
                 <span>Priority Factor:</span><span className="font-medium text-right text-white">{priorityFactor}</span>
            </div>
            {rejectionReasons.length > 0 && (
                <div className="pt-2">
                    <p className="text-xs text-red-400 font-medium mb-1">Rejection Reasons:</p>
                    <ul className="list-disc list-inside text-xs text-red-400/90 space-y-0.5">
                        {rejectionReasons.map((reason: string, i: number) => <li key={i}>{reason}</li>)}
                    </ul>
      </div>
            )}
        </CardContent>
         {/* Optional: Add a footer for the details toggle if eligibilityDetails exist */}
         {eligibilityDetails && (Object.keys(eligibilityDetails.met || {}).length > 0 || Object.keys(eligibilityDetails.not_met || {}).length > 0 || Object.keys(eligibilityDetails.unsure || {}).length > 0) && (
             <CardFooter className="p-2 bg-black/20">
                <Button variant="ghost" size="sm" className="w-full text-teal-300 hover:text-teal-200 hover:bg-teal-900/30 text-xs" onClick={() => setShowDetails(!showDetails)}>
                     {showDetails ? 'Hide Details' : 'Show Eligibility Details'}
                </Button>
             </CardFooter>
         )}

        {/* Collapsible Details Section */}
         {showDetails && eligibilityDetails && (
             <div className="p-4 border-t border-teal-800/60 bg-black/30 text-xs space-y-3">
                {/* Met Criteria */}
                {eligibilityDetails.met?.length > 0 && (
                     <div>
                         <h5 className="font-semibold text-teal-300 mb-1">✅ Met Criteria:</h5>
                         <ul className="list-disc list-inside space-y-1 text-gray-300 pl-2">
                             {eligibilityDetails.met.map((item: any, i: number) => <li key={`met-${i}`}>{item.criterion}: {item.reasoning}</li>)}
                         </ul>
                     </div>
                 )}
                 {/* Not Met Criteria */}
                 {eligibilityDetails.not_met?.length > 0 && (
                     <div>
                         <h5 className="font-semibold text-red-400 mb-1">❌ Not Met Criteria:</h5>
                         <ul className="list-disc list-inside space-y-1 text-gray-300 pl-2">
                             {eligibilityDetails.not_met.map((item: any, i: number) => <li key={`notmet-${i}`}>{item.criterion}: {item.reasoning}</li>)}
                         </ul>
                     </div>
                 )}
                 {/* Unsure Criteria */}
                 {eligibilityDetails.unsure?.length > 0 && (
                     <div>
                         <h5 className="font-semibold text-yellow-400 mb-1">❓ Uncertain Criteria:</h5>
                         <ul className="list-disc list-inside space-y-1 text-gray-300 pl-2">
                             {eligibilityDetails.unsure.map((item: any, i: number) => <li key={`unsure-${i}`}>{item.criterion}: {item.reasoning}</li>)}
                         </ul>
      </div>
                 )}
      </div>
         )}
    </Card>
  );
}
