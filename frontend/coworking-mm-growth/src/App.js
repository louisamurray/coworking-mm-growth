import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
    // State variables for user inputs and results
    const [membershipFee, setMembershipFee] = useState(500);
    const [totalSeats, setTotalSeats] = useState(100);
    const [occupiedSeats, setOccupiedSeats] = useState(20);
    const [turnoverRate, setTurnoverRate] = useState(10);
    const [growthFactor, setGrowthFactor] = useState(5);
    const [results, setResults] = useState(null);

    // Handler for form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            membershipFee: parseFloat(membershipFee),
            availableSeats: parseInt(totalSeats - occupiedSeats, 10),
            occupiedSeats: parseInt(occupiedSeats, 10),
            turnoverRate: parseFloat(turnoverRate),
            growthFactor: parseFloat(growthFactor),
        };
        try {
            const response = await axios.post('http://127.0.0.1:5000/calculate_growth', data);
            setResults(response.data);
        } catch (error) {
            console.error("Error making the request!", error);
        }
    };

    // Reset all input fields to their initial values
    const handleReset = () => {
        setMembershipFee(500);
        setTotalSeats(100);
        setOccupiedSeats(20);
        setTurnoverRate(10);
        setGrowthFactor(5);
        setResults(null);
    };

    // Renders a table for growth data
    const renderTable = (title, data) => (
        <div>
            <h3>{title}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        {Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`).map(month => (
                            <th key={month}>{month}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[
                        { label: 'Total Members beginning of month', key: 'totalMembersBeginning', bold: true, type: 'number' },
                        { label: 'Total Members end of month', key: 'totalMembersEnd', type: 'number' },
                        { label: 'New members needed each month', key: 'newMembers', type: 'number' },
                        { label: 'Available Seats beginning of month', key: 'availableSeatsBeginning', bold: true, type: 'number' },
                        { label: 'Available Seats end of month', key: 'availableSeatsEnd', type: 'number' },
                        { label: 'Member Revenue beginning of month', key: 'mrrBeginning', type: 'currency' },
                        { label: 'Member Revenue end of month', key: 'mrrEnd', type: 'currency' },
                        { label: 'Net new member revenue', key: 'netNewRevenue', bold: true, type: 'currency' },
                        { label: 'm/m growth rate', key: 'growthRate', type: 'percentage' }
                    ].map(({ label, key, bold, type }, index) => (
                        <tr key={key} style={{ fontWeight: bold ? 'bold' : 'normal' }}>
                            <td>{label}</td>
                            {data.map(row => (
                                <td key={row.month} className={type}>
                                    {type === 'currency' ? `$${row[key].toLocaleString()}` :
                                     type === 'percentage' ? `${row[key]}%` : 
                                     row[key].toLocaleString()}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );



    // Renders a summary card with key metrics
    const renderSummary = (summary) => (
        <div className="summary-card">
            <h2>Summary</h2>
            <div className="summary-item">
                <span>Total Seats:</span> {summary.totalSeats}
            </div>
            <div className="summary-item">
                <span>Available Seats:</span> {summary.availableSeats}
            </div>
            <div className="summary-item">
                <span>Currently Occupied Seats:</span> {summary.currentlyOccupiedSeats}
            </div>
            <div className="summary-item">
                <span>Member Revenue:</span> ${summary.memberRevenue}
            </div>
            <div className="summary-item">
                <span>Membership Fee:</span> ${summary.membershipFee}
            </div>
            <div className="summary-item">
                <span>Turnover Seats / Month:</span> {summary.turnoverSeatsPerMonth}%
            </div>
        </div>
    );

    return (
        <div className="calculator-container">
            <h1>Coworking Space Growth Calculator</h1>
            <div className="form-summary-container">
                <form onSubmit={handleSubmit} className="form-container">
                    {[
                        { label: 'Membership Fee / Seat', value: membershipFee, setter: setMembershipFee },
                        { label: 'Total Seats', value: totalSeats, setter: setTotalSeats },
                        { label: 'Currently Occupied Seats', value: occupiedSeats, setter: setOccupiedSeats },
                        { label: 'Turnover Rate (%)', value: turnoverRate, setter: setTurnoverRate },
                        { label: 'Growth Rate (e.g., 5 for 5x)', value: growthFactor, setter: setGrowthFactor },
                    ].map(({ label, value, setter }, index) => (
                        <div className="form-group" key={index}>
                            <label>{label}</label>
                            <input
                                type="number"
                                value={value}
                                onChange={e => setter(e.target.value)}
                            />
                        </div>
                    ))}
                    <button type="submit">Calculate</button>
                    <button type="button" onClick={handleReset}>Reset</button>
                </form>
                {results && <div className="summary-container">{renderSummary(results.summary)}</div>}
            </div>
            {results && (
                <div className="results">
                    {renderTable('Linear Growth', results.linearGrowth)}
                    {renderTable('Constant Growth', results.constantGrowth)}
                    {renderTable('Exponential Growth', results.exponentialGrowth)}
                </div>
            )}
        </div>
    );
}

export default App;
