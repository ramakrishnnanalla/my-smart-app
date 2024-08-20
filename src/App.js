import React, { useEffect, useState } from 'react';

export default function App(props) {
    const { client } = props;
    const [patientIds, setPatientIds] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [error, setError] = useState(null);
    console.log(client, 'Client')
    // Sample patient IDs you have
    // Sample patient IDs you have
    const samplePatientIds = [
        'erXuFYUfucBZaryVksYEcMg3',
        'eq081-VQEgP8drUUqCWzHfw3',
        'eIXesllypH3M9tAA5WdJftQ3',
        'e63wRTbPfr1p8UW81d8Seiw3'
        // Add more patient IDs as needed
    ];

    useEffect(() => {
        // Set the patient IDs after obtaining the access token
        setPatientIds(samplePatientIds);
    }, []);

    const fetchPatientDetailsManually = async (patientId) => {
        const accessToken = client.state.token; // Get the access token from the client state

        try {
            const response = await fetch(`https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Patient/${patientId}`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Accept": "application/json+fhir",
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const patientData = await response.json();
            console.log('Patient Data:', patientData);
            setSelectedPatient(patientData);
            setError(null); // Clear any previous errors
        } catch (err) {
            setError("Error fetching patient details: " + err.message);
            setSelectedPatient(null);
        }
    };
    return (
        <div>
            <h1>Patient IDs</h1>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {patientIds.length > 0 ? (
                <ul>
                    {patientIds.map((id) => (
                        <li key={id} onClick={() => fetchPatientDetailsManually(id)} style={{ cursor: 'pointer', color: 'blue' }}>
                            Patient ID: {id}
                        </li>
                    ))}
                </ul>
            ) : (
                <div>No patient IDs available.</div>
            )}
            {selectedPatient && (
                <div>
                    <h2>Patient Details</h2>
                    <p><strong>Name:</strong> {selectedPatient.name[0].given.join(" ")} {selectedPatient.name[0].family}</p>
                    <p><strong>DOB:</strong> {selectedPatient.birthDate}</p>
                    <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                    {/* Display other patient details as needed */}
                </div>
            )}
        </div>
    );
}





