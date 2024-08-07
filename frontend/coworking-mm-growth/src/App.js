import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [membershipFee, setMembershipFee] = useState(145);
    const [availableSeats, setAvailableSeats] = useState(28);
    const [occupiedSeats, setOccupiedSeats] = useState(1);
    const [turnoverSeats, setTurnoverSeats] = useState(1);
    const [growthFactor, setGrowthFactor] = useState(5);
    const [results, setResults] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            membershipFee,
            availableSeats,
            occupiedSeats,
            turnoverSeats,
            growthFactor,
        };
        try {
            const response = await axios.post('http://127.0.0.1:5000/calculate_growth', data);
            setResults(response.data);
        } catch (error) {
            console.error("There was an error making the request!", error);
        }
    };

    const handleReset = () => {
        setMembershipFee(145);
        setAvailableSeats(28);
        setOccupiedSeats(1);
        setTurnoverSeats(1);
        setGrowthFactor(5);
        setResults(null);
    };

    const renderTable = (title, data) => {
        const months = Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`);
        const metrics = [
            'newMembers',
            'availableSeats',
            'mrrBeginning',
            'netNewRevenue',
            'mrrEnd',
            'growthRate',
        ];
        const metricLabels = [
            'New members needed each month',
            'Available Seats beginning of month',
            'MRR beginning of month',
            'Net new MRR',
            'MRR end of month',
            'm/m growth rate',
        ];

        return (
            <div>
                <h3>{title}</h3>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            {months.map((month) => (
                                <th key={month}>{month}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {metrics.map((metric, index) => (
                            <tr key={metric}>
                                <td>{metricLabels[index]}</td>
                                {data.map((row) => (
                                    <td key={row.month}>{Math.round(row[metric])}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderSummary = (summary) => {
        return (
            <div className="summary-card">
                <h2>Summary</h2>
                <div className="summary-item">
                    <span>Member Revenue:</span> ${Math.round(summary.memberRevenue)}
                </div>
                <div className="summary-item">
                    <span>Membership Fee / Seat:</span> ${Math.round(summary.membershipFee)}
                </div>
                <div className="summary-item">
                    <span>Available Seats:</span> {Math.round(summary.availableSeats)}
                </div>
                <div className="summary-item">
                    <span>Currently Occupied Seats:</span> {Math.round(summary.currentlyOccupiedSeats)}
                </div>
                <div className="summary-item">
                    <span>Turnover Seats / Month:</span> {Math.round(summary.turnoverSeatsPerMonth)}
                </div>
            </div>
        );
    };

    return (
        <div className="calculator-container">
            <h1>Coworking Space Growth Calculator</h1>
            <div className="form-summary-container">
                <form onSubmit={handleSubmit} className="form-container">
                    <div className="form-group">
                        <label>Membership Fee / Seat</label>
                        <input type="number" value={membershipFee} onChange={(e) => setMembershipFee(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Available Seats</label>
                        <input type="number" value={availableSeats} onChange={(e) => setAvailableSeats(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Currently Occupied Seats</label>
                        <input type="number" value={occupiedSeats} onChange={(e) => setOccupiedSeats(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Turnover Seats / Month</label>
                        <input type="number" value={turnoverSeats} onChange={(e) => setTurnoverSeats(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Growth Rate (e.g., 5 for 5x)</label>
                        <input type="number" value={growthFactor} onChange={(e) => setGrowthFactor(e.target.value)} />
                    </div>
                    <button type="submit">Calculate</button>
                    <button type="button" onClick={handleReset}>Reset</button>
                </form>
                {results && (
                    <div className="summary-container">
                        {renderSummary(results.summary)}
                    </div>
                )}
            </div>
            {results && (
                <div className="results">
                    {renderTable('Steady Growth', results.steadyGrowth)}
                    {renderTable('Exponential Growth', results.exponentialGrowth)}
                    {renderTable('Linear Growth', results.linearGrowth)}
                </div>
            )}
        </div>
    );
}

export default App;