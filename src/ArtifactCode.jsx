<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Designer's Robotics Journey</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .heading-font {
            font-family: 'Space Grotesk', sans-serif;
        }
        .glass-morphism {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
        }
        .progress-ring {
            transform: rotate(-90deg);
        }
        .engineer-corner {
            background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
        }
        .reflection-bg {
            background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
        }
        .task-complete {
            animation: taskComplete 0.5s ease-out;
        }
        @keyframes taskComplete {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        .scroll-container {
            scrollbar-width: thin;
            scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
        }
        .scroll-container::-webkit-scrollbar {
            width: 6px;
        }
        .scroll-container::-webkit-scrollbar-track {
            background: transparent;
        }
        .scroll-container::-webkit-scrollbar-thumb {
            background-color: rgba(156, 163, 175, 0.3);
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect, useCallback } = React;

        // Learning curriculum data structure
        const curriculum = {
            months: [
                {
                    id: 1,
                    title: "Animated Objects",
                    theme: "Making Things Move with Personality",
                    weeks: [
                        {
                            week: 1,
                            title: "Movement Fundamentals",
                            days: [
                                {
                                    day: 1,
                                    title: "Getting Started with Arduino",
                                    tasks: [
                                        { id: "t1", text: "Set up Arduino IDE", duration: "30 min", type: "setup" },
                                        { id: "t2", text: "Connect your first servo", duration: "45 min", type: "build" },
                                        { id: "t3", text: "Make servo sweep back and forth", duration: "45 min", type: "code" },
                                        { id: "t4", text: "Sketch 5 robot head designs", duration: "30 min", type: "design" }
                                    ],
                                    engineerCorner: {
                                        topic: "PWM Signals",
                                        content: "Learn how Pulse Width Modulation controls servo position. Servos expect a pulse every 20ms, with pulse width determining angle (1ms = 0°, 2ms = 180°).",
                                        resources: ["Arduino PWM Tutorial", "Servo Motor Basics PDF"],
                                        optional: true
                                    },
                                    reflection: [
                                        "What personality did your servo movement suggest?",
                                        "How could timing change the emotion of the movement?",
                                        "What surprised you about working with physical motion?"
                                    ]
                                },
                                {
                                    day: 2,
                                    title: "Adding Personality to Movement",
                                    tasks: [
                                        { id: "t5", text: "Program 'curious' servo movement", duration: "60 min", type: "code" },
                                        { id: "t6", text: "Add acceleration/deceleration", duration: "45 min", type: "code" },
                                        { id: "t7", text: "Film three different emotions", duration: "30 min", type: "document" },
                                        { id: "t8", text: "Test with a friend - what do they feel?", duration: "15 min", type: "test" }
                                    ],
                                    engineerCorner: {
                                        topic: "Motion Profiles",
                                        content: "Explore trapezoidal vs S-curve motion profiles. Learn how acceleration control creates more natural movement.",
                                        resources: ["Easing Functions Visualized", "Motion Control Basics"],
                                        optional: true
                                    },
                                    reflection: [
                                        "Which movement felt most 'alive'?",
                                        "How did speed changes affect perceived emotion?",
                                        "What would you change after user feedback?"
                                    ]
                                },
                                {
                                    day: 3,
                                    title: "Two-Axis Coordination",
                                    tasks: [
                                        { id: "t9", text: "Add second servo for pan-tilt", duration: "45 min", type: "build" },
                                        { id: "t10", text: "Coordinate movement between axes", duration: "60 min", type: "code" },
                                        { id: "t11", text: "Create 'looking around' behavior", duration: "45 min", type: "design" },
                                        { id: "t12", text: "Design housing/face concepts", duration: "30 min", type: "design" }
                                    ],
                                    engineerCorner: {
                                        topic: "Coordinate Systems",
                                        content: "Introduction to 2D coordinate systems and basic trigonometry for calculating servo angles from target positions.",
                                        resources: ["2D Kinematics Simplified", "Arduino Math Functions"],
                                        optional: true
                                    },
                                    reflection: [
                                        "How does coordinated movement differ from independent?",
                                        "What patterns make movement feel intentional?",
                                        "Sketch tomorrow's build plan"
                                    ]
                                },
                                {
                                    day: 4,
                                    title: "Sensor Integration",
                                    tasks: [
                                        { id: "t13", text: "Add ultrasonic sensor", duration: "45 min", type: "build" },
                                        { id: "t14", text: "Make robot track nearest object", duration: "60 min", type: "code" },
                                        { id: "t15", text: "Design reactions (curious/shy/excited)", duration: "45 min", type: "design" },
                                        { id: "t16", text: "Start 3D printing shell/face", duration: "30 min", type: "build" }
                                    ],
                                    engineerCorner: {
                                        topic: "Sensor Fusion Basics",
                                        content: "How to combine multiple sensors and filter noise. Introduction to simple moving averages and threshold detection.",
                                        resources: ["Ultrasonic Sensor Deep Dive", "Sensor Filtering Techniques"],
                                        optional: true
                                    },
                                    reflection: [
                                        "How did sensing change your robot's behavior?",
                                        "What unexpected interactions emerged?",
                                        "Document today's discoveries with video"
                                    ]
                                },
                                {
                                    day: 5,
                                    title: "State Machines & Personality",
                                    tasks: [
                                        { id: "t17", text: "Implement mood states (happy/sad/curious)", duration: "60 min", type: "code" },
                                        { id: "t18", text: "Add LED expressions", duration: "45 min", type: "build" },
                                        { id: "t19", text: "Create state transition triggers", duration: "45 min", type: "code" },
                                        { id: "t20", text: "Film personality showcase", duration: "30 min", type: "document" }
                                    ],
                                    engineerCorner: {
                                        topic: "Finite State Machines",
                                        content: "FSM theory and implementation patterns. How to design robust state transitions and avoid edge cases.",
                                        resources: ["FSM in Arduino", "State Pattern Tutorial"],
                                        optional: true
                                    },
                                    reflection: [
                                        "Which personality state felt most convincing?",
                                        "How do transitions affect believability?",
                                        "Plan weekend integration session"
                                    ]
                                }
                            ]
                        },
                        {
                            week: 2,
                            title: "Adding Character",
                            days: [
                                {
                                    day: 6,
                                    title: "Touch and Response",
                                    tasks: [
                                        { id: "t21", text: "Add capacitive touch sensors", duration: "45 min", type: "build" },
                                        { id: "t22", text: "Design touch-triggered animations", duration: "60 min", type: "code" },
                                        { id: "t23", text: "Create 'petting' response", duration: "45 min", type: "design" },
                                        { id: "t24", text: "Test emotional responses with users", duration: "30 min", type: "test" }
                                    ],
                                    engineerCorner: {
                                        topic: "Capacitive Sensing",
                                        content: "How capacitive touch works, RC timing, and creating custom touch surfaces with conductive materials.",
                                        resources: ["DIY Touch Sensors", "Capacitive Sensing Theory"],
                                        optional: true
                                    },
                                    reflection: [
                                        "What touch interactions felt most natural?",
                                        "How does physical interaction change attachment?",
                                        "Document user reactions"
                                    ]
                                },
                                {
                                    day: 7,
                                    title: "Weekend Deep Dive",
                                    tasks: [
                                        { id: "t25", text: "Refine all behaviors", duration: "90 min", type: "build" },
                                        { id: "t26", text: "Create final shell/skin", duration: "60 min", type: "design" },
                                        { id: "t27", text: "Film final personality demo", duration: "60 min", type: "document" },
                                        { id: "t28", text: "Share online for feedback", duration: "30 min", type: "document" }
                                    ],
                                    engineerCorner: {
                                        topic: "System Integration",
                                        content: "Best practices for combining multiple systems: power management, timing, and debugging complex behaviors.",
                                        resources: ["Arduino Best Practices", "Debugging Physical Computing"],
                                        optional: true
                                    },
                                    reflection: [
                                        "What did you learn about bringing objects to life?",
                                        "How has your view of robotics changed?",
                                        "What will you explore in Month 2?"
                                    ]
                                }
                            ]
                        }
                        // Weeks 3-4 would continue...
                    ]
                }
                // Months 2-6 would continue with similar structure...
            ]
        };

        // Main App Component
        function RoboticsJourney() {
            const [currentDay, setCurrentDay] = useState(() => {
                const saved = localStorage.getItem('currentDay');
                return saved ? parseInt(saved) : 1;
            });
            
            const [completedTasks, setCompletedTasks] = useState(() => {
                const saved = localStorage.getItem('completedTasks');
                return saved ? JSON.parse(saved) : {};
            });
            
            const [journalEntries, setJournalEntries] = useState(() => {
                const saved = localStorage.getItem('journalEntries');
                return saved ? JSON.parse(saved) : {};
            });
            
            const [showEngineerCorner, setShowEngineerCorner] = useState(false);
            const [showReflection, setShowReflection] = useState(false);
            const [currentReflection, setCurrentReflection] = useState('');

            // Calculate current month and week
            const totalDays = 180; // 6 months
            const currentMonth = Math.ceil(currentDay / 30);
            const currentWeek = Math.ceil((currentDay % 30) / 7) || 4;
            const dayInWeek = ((currentDay - 1) % 7) + 1;

            // Get today's content
            const getTodayContent = () => {
                const month = curriculum.months[0]; // Using month 1 as example
                const week = month.weeks[Math.min(Math.floor((currentDay - 1) / 7), 1)];
                const day = week?.days[Math.min((currentDay - 1) % 7, week.days.length - 1)];
                return day || week?.days[0];
            };

            const todayContent = getTodayContent();

            // Save state to localStorage
            useEffect(() => {
                localStorage.setItem('currentDay', currentDay.toString());
                localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
                localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
            }, [currentDay, completedTasks, journalEntries]);

            // Toggle task completion
            const toggleTask = (taskId) => {
                setCompletedTasks(prev => ({
                    ...prev,
                    [taskId]: !prev[taskId]
                }));
            };

            // Calculate progress
            const calculateProgress = () => {
                if (!todayContent) return 0;
                const todayTaskIds = todayContent.tasks.map(t => t.id);
                const completed = todayTaskIds.filter(id => completedTasks[id]).length;
                return (completed / todayTaskIds.length) * 100;
            };

            // Save journal entry
            const saveJournalEntry = () => {
                if (currentReflection.trim()) {
                    setJournalEntries(prev => ({
                        ...prev,
                        [`day-${currentDay}`]: {
                            date: new Date().toISOString(),
                            entry: currentReflection,
                            progress: calculateProgress()
                        }
                    }));
                    setCurrentReflection('');
                }
            };

            const progress = calculateProgress();

            return (
                <div className="min-h-screen p-4 md:p-6 lg:p-8">
                    {/* Header */}
                    <header className="glass-morphism rounded-2xl p-6 mb-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="heading-font text-3xl font-bold text-gray-800">
                                    Designer's Robotics Journey
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Day {currentDay} of 180 • Month {currentMonth} • Week {currentWeek}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <svg className="progress-ring w-20 h-20">
                                        <circle
                                            cx="40"
                                            cy="40"
                                            r="36"
                                            fill="none"
                                            stroke="#e5e7eb"
                                            strokeWidth="8"
                                        />
                                        <circle
                                            cx="40"
                                            cy="40"
                                            r="36"
                                            fill="none"
                                            stroke="#8b5cf6"
                                            strokeWidth="8"
                                            strokeDasharray={`${2 * Math.PI * 36}`}
                                            strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <p className="text-sm text-gray-600 mt-1">{Math.round(progress)}%</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Today's Focus */}
                            <div className="glass-morphism rounded-2xl p-6">
                                <h2 className="heading-font text-2xl font-semibold text-gray-800 mb-4">
                                    Today: {todayContent?.title}
                                </h2>
                                
                                {/* Tasks */}
                                <div className="space-y-3">
                                    {todayContent?.tasks.map(task => (
                                        <div
                                            key={task.id}
                                            className={`flex items-center gap-4 p-4 rounded-lg bg-white/50 hover:bg-white/70 transition cursor-pointer ${
                                                completedTasks[task.id] ? 'task-complete' : ''
                                            }`}
                                            onClick={() => toggleTask(task.id)}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                completedTasks[task.id] 
                                                    ? 'bg-green-500 border-green-500' 
                                                    : 'border-gray-400'
                                            }`}>
                                                {completedTasks[task.id] && (
                                                    <i className="fas fa-check text-white text-xs"></i>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-medium ${
                                                    completedTasks[task.id] ? 'text-gray-500 line-through' : 'text-gray-800'
                                                }`}>
                                                    {task.text}
                                                </p>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-sm text-gray-500">
                                                        <i className="far fa-clock mr-1"></i>
                                                        {task.duration}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        task.type === 'build' ? 'bg-blue-100 text-blue-700' :
                                                        task.type === 'code' ? 'bg-green-100 text-green-700' :
                                                        task.type === 'design' ? 'bg-purple-100 text-purple-700' :
                                                        task.type === 'test' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {task.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Engineer's Corner */}
                            <div className="glass-morphism rounded-2xl p-6">
                                <div 
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => setShowEngineerCorner(!showEngineerCorner)}
                                >
                                    <h3 className="heading-font text-xl font-semibold text-gray-800">
                                        <i className="fas fa-cog mr-2 text-orange-500"></i>
                                        Engineer's Corner (Optional)
                                    </h3>
                                    <i className={`fas fa-chevron-${showEngineerCorner ? 'up' : 'down'} text-gray-500`}></i>
                                </div>
                                
                                {showEngineerCorner && todayContent?.engineerCorner && (
                                    <div className="mt-4 p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
                                        <h4 className="font-semibold text-gray-800 mb-2">
                                            Today's Deep Dive: {todayContent.engineerCorner.topic}
                                        </h4>
                                        <p className="text-gray-700 mb-3">
                                            {todayContent.engineerCorner.content}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {todayContent.engineerCorner.resources.map((resource, idx) => (
                                                <span key={idx} className="text-xs px-3 py-1 bg-white rounded-full text-orange-600">
                                                    <i className="fas fa-book mr-1"></i>
                                                    {resource}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Reflection & Journal */}
                            <div className="glass-morphism rounded-2xl p-6">
                                <div 
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => setShowReflection(!showReflection)}
                                >
                                    <h3 className="heading-font text-xl font-semibold text-gray-800">
                                        <i className="fas fa-brain mr-2 text-purple-500"></i>
                                        Reflection & Journal
                                    </h3>
                                    <i className={`fas fa-chevron-${showReflection ? 'up' : 'down'} text-gray-500`}></i>
                                </div>
                                
                                {showReflection && (
                                    <div className="mt-4 space-y-4">
                                        {/* Reflection Prompts */}
                                        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                                            <h4 className="font-semibold text-gray-800 mb-3">Today's Reflection</h4>
                                            <ul className="space-y-2">
                                                {todayContent?.reflection.map((prompt, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="text-purple-500 mt-1">•</span>
                                                        <span className="text-gray-700">{prompt}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        
                                        {/* Journal Entry */}
                                        <div>
                                            <textarea
                                                className="w-full p-4 rounded-lg border border-gray-200 focus:border-purple-500 focus:outline-none resize-none"
                                                rows="4"
                                                placeholder="Write your thoughts, discoveries, and ideas..."
                                                value={currentReflection}
                                                onChange={(e) => setCurrentReflection(e.target.value)}
                                            />
                                            <button
                                                onClick={saveJournalEntry}
                                                className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                                            >
                                                Save Entry
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Navigation */}
                            <div className="glass-morphism rounded-2xl p-6">
                                <h3 className="heading-font text-lg font-semibold text-gray-800 mb-4">
                                    Navigation
                                </h3>
                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}
                                        className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                        disabled={currentDay === 1}
                                    >
                                        <i className="fas fa-chevron-left mr-1"></i>
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentDay(Math.min(180, currentDay + 1))}
                                        className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                        disabled={currentDay === 180}
                                    >
                                        Next
                                        <i className="fas fa-chevron-right ml-1"></i>
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        const today = new Date();
                                        const startDate = new Date('2024-01-01'); // Adjust your start date
                                        const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
                                        setCurrentDay(Math.min(Math.max(1, daysSinceStart), 180));
                                    }}
                                    className="w-full px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                                >
                                    Go to Today
                                </button>
                            </div>

                            {/* Quick Stats */}
                            <div className="glass-morphism rounded-2xl p-6">
                                <h3 className="heading-font text-lg font-semibold text-gray-800 mb-4">
                                    Your Progress
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Tasks Completed</span>
                                        <span className="font-semibold">{Object.keys(completedTasks).length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Journal Entries</span>
                                        <span className="font-semibold">{Object.keys(journalEntries).length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Current Streak</span>
                                        <span className="font-semibold">🔥 {currentDay} days</span>
                                    </div>
                                </div>
                            </div>

                            {/* Resources */}
                            <div className="glass-morphism rounded-2xl p-6">
                                <h3 className="heading-font text-lg font-semibold text-gray-800 mb-4">
                                    Quick Resources
                                </h3>
                                <div className="space-y-2">
                                    <a href="#" className="block p-3 bg-white/50 rounded-lg hover:bg-white/70 transition">
                                        <i className="fab fa-youtube text-red-500 mr-2"></i>
                                        Video Tutorials
                                    </a>
                                    <a href="#" className="block p-3 bg-white/50 rounded-lg hover:bg-white/70 transition">
                                        <i className="fab fa-github text-gray-700 mr-2"></i>
                                        Code Examples
                                    </a>
                                    <a href="#" className="block p-3 bg-white/50 rounded-lg hover:bg-white/70 transition">
                                        <i className="fab fa-discord text-indigo-500 mr-2"></i>
                                        Community
                                    </a>
                                </div>
                            </div>

                            {/* Inspiration */}
                            <div className="glass-morphism rounded-2xl p-6">
                                <h3 className="heading-font text-lg font-semibold text-gray-800 mb-4">
                                    Daily Inspiration
                                </h3>
                                <p className="text-gray-700 italic">
                                    "Design is not just what it looks like and feels like. Design is how it works."
                                </p>
                                <p className="text-gray-500 text-sm mt-2">- Steve Jobs</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Render the app
        ReactDOM.render(<RoboticsJourney />, document.getElementById('root'));
    </script>
</body>
</html>
