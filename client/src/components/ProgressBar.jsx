import React from 'react';

export default function ProgressBar({ completed, total }) {
    const percentage = (completed / total) * 100;

    return (
        <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
            <span className="progress-text">
                {completed} / {total} lessons completed
            </span>
        </div>
    );
}
