import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ManageCourse() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch course details and lessons
        setLoading(false);
    }, [courseId]);

    return (
        <div>
            <h1>Manage Course</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <h2>{course?.title}</h2>
                    <div className="lessons-list">
                        {/* Display lessons here */}
                    </div>
                    <button>Add Lesson</button>
                </div>
            )}
        </div>
    );
}
