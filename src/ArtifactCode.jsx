<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Robotics Learning Journey</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }

        .app-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .header h1 {
            font-size: 2.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }

        .header p {
            color: #666;
            font-size: 1.1rem;
        }

        .progress-bar {
            height: 8px;
            background: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 20px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 10px;
            transition: width 0.3s ease;
        }

        .main-content {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 30px;
        }

        .sidebar {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 25px;
            height: fit-content;
            position: sticky;
            top: 20px;
        }

        .month-selector {
            margin-bottom: 20px;
        }

        .month-btn {
            width: 100%;
            padding: 12px;
            margin-bottom: 10px;
            border: none;
            border-radius: 10px;
            background: #f5f5f5;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
            text-align: left;
        }

        .month-btn:hover {
            background: #e8e8e8;
            transform: translateX(5px);
        }

        .month-btn.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .week-list {
            margin-top: 20px;
        }

        .week-btn {
            width: 100%;
            padding: 10px;
            margin-bottom: 8px;
            border: 2px solid transparent;
            border-radius: 8px;
            background: #f9f9f9;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            font-size: 0.9rem;
        }

        .week-btn:hover {
            border-color: #667eea;
        }

        .week-btn.active {
            background: #667eea;
            color: white;
        }

        .week-btn.completed {
            background: #4caf50;
            color: white;
        }

        .content-area {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            min-height: 600px;
        }

        .week-header {
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .week-title {
            font-size: 2rem;
            color: #333;
            margin-bottom: 10px;
        }

        .week-theme {
            color: #666;
            font-style: italic;
            font-size: 1.2rem;
        }

        .daily-tasks {
            margin-bottom: 30px;
        }

        .day-section {
            background: #f9f9f9;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .day-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .day-title {
            font-size: 1.3rem;
            color: #333;
        }

        .task-checkbox {
            width: 24px;
            height: 24px;
            cursor: pointer;
        }

        .task-list {
            list-style: none;
            margin-left: 20px;
        }

        .task-item {
            padding: 8px 0;
            display: flex;
            align-items: start;
            gap: 10px;
        }

        .task-item input[type="checkbox"] {
            margin-top: 3px;
        }

        .engineers-corner {
            background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
            border-radius: 12px;
            padding: 20px;
            margin-top: 30px;
        }

        .corner-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            user-select: none;
        }

        .corner-title {
            font-size: 1.2rem;
            color: #555;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .corner-content {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #d0d0d0;
        }

        .reflection-section {
            background: #f0f7ff;
            border-radius: 12px;
            padding: 25px;
            margin-top: 30px;
        }

        .reflection-title {
            font-size: 1.3rem;
            color: #333;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .reflection-prompt {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            border-left: 4px solid #667eea;
        }

        .journal-textarea {
            width: 100%;
            min-height: 150px;
            padding: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1rem;
            font-family: inherit;
            resize: vertical;
            margin-top: 15px;
        }

        .journal-textarea:focus {
            outline: none;
            border-color: #667eea;
        }

        .save-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 15px;
            transition: transform 0.2s ease;
        }

        .save-btn:hover {
            transform: translateY(-2px);
        }

        .resources-section {
            background: #fff9e6;
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
        }

        .resource-link {
            color: #667eea;
            text-decoration: none;
            display: block;
            padding: 5px 0;
        }

        .resource-link:hover {
            text-decoration: underline;
        }

        .toggle-arrow {
            transition: transform 0.3s ease;
            display: inline-block;
        }

        .toggle-arrow.open {
            transform: rotate(90deg);
        }

        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: bold;
            margin-left: 10px;
        }

        .badge-new {
            background: #4caf50;
            color: white;
        }

        .badge-optional {
            background: #ff9800;
            color: white;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }

        .stat-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
        }

        .stat-label {
            color: #666;
            font-size: 0.9rem;
            margin-top: 5px;
        }

        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
            }
            
            .sidebar {
                position: static;
            }
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect } = React;

        // Curriculum data structure
        const curriculum = {
            month1: {
                title: "Month 1: Animated Objects",
                theme: "Making Things Move with Personality",
                weeks: [
                    {
                        id: "week1",
                        title: "Week 1: Movement Fundamentals",
                        theme: "Basic servo control & personality exploration",
                        days: {
                            monday: {
                                title: "Getting Started with Arduino",
                                tasks: [
                                    "Set up Arduino IDE and test with blink sketch",
                                    "Connect your first servo and make it sweep",
                                    "Sketch 10 different robot head designs"
                                ],
                                time: "2.5 hours"
                            },
                            tuesday: {
                                title: "Servo Personality",
                                tasks: [
                                    "Program servo to move in 'curious' pattern",
                                    "Create 'shy' and 'excited' movement patterns",
                                    "Document movement patterns with video"
                                ],
                                time: "2 hours"
                            },
                            wednesday: {
                                title: "Two-Servo Coordination",
                                tasks: [
                                    "Build 2-servo pan-tilt mechanism",
                                    "Program smooth, coordinated movements",
                                    "Create 'looking around' behavior"
                                ],
                                time: "2.5 hours"
                            },
                            thursday: {
                                title: "Form Exploration",
                                tasks: [
                                    "3D model three different head designs",
                                    "Print or craft one prototype",
                                    "Test how form affects perceived personality"
                                ],
                                time: "2 hours"
                            },
                            friday: {
                                title: "Integration & Testing",
                                tasks: [
                                    "Combine best movements with best form",
                                    "Film your robot showing 3 emotions",
                                    "Share progress online for feedback"
                                ],
                                time: "2.5 hours"
                            },
                            weekend: {
                                title: "Deep Work Session",
                                tasks: [
                                    "Refine mechanical assembly",
                                    "Polish movement sequences",
                                    "Create week 1 documentation"
                                ],
                                time: "4 hours"
                            }
                        },
                        engineersCorner: {
                            topics: [
                                "PWM (Pulse Width Modulation) fundamentals",
                                "Servo motor internals: potentiometer feedback loop",
                                "Basic control theory: open vs closed loop",
                                "Arduino timers and interrupts"
                            ],
                            resources: [
                                "Arduino PWM Tutorial - sparkfun.com/learn",
                                "Control Systems Basics - Brian Douglas YouTube",
                                "Servo teardown video - BigClive"
                            ]
                        },
                        reflection: [
                            "What personality traits were easiest to express through movement?",
                            "How did the physical form change how people perceived the robot?",
                            "What surprised you about servo control?",
                            "Sketch three improvements for next week"
                        ],
                        resources: [
                            "Arduino Project Hub - Servo Projects",
                            "Instructables: Servo Mechanisms",
                            "Making Things Move - Chapter 6"
                        ]
                    },
                    {
                        id: "week2",
                        title: "Week 2: Adding Sensors & State",
                        theme: "Making robots aware and responsive",
                        days: {
                            monday: {
                                title: "Touch and Proximity",
                                tasks: [
                                    "Add ultrasonic sensor for distance detection",
                                    "Implement 'back away when too close' behavior",
                                    "Test different response curves"
                                ],
                                time: "2.5 hours"
                            },
                            tuesday: {
                                title: "Light and Sound Response",
                                tasks: [
                                    "Add photoresistor for light tracking",
                                    "Program robot to 'look' at brightest light",
                                    "Create sound-reactive movements"
                                ],
                                time: "2 hours"
                            },
                            wednesday: {
                                title: "State Machines",
                                tasks: [
                                    "Implement happy/sad/curious/sleepy states",
                                    "Create transitions between states",
                                    "Add LED indicators for each state"
                                ],
                                time: "2.5 hours"
                            },
                            thursday: {
                                title: "Behavioral Refinement",
                                tasks: [
                                    "Smooth state transitions with easing",
                                    "Add random 'idle' animations",
                                    "Create attention-getting behaviors"
                                ],
                                time: "2 hours"
                            },
                            friday: {
                                title: "User Testing",
                                tasks: [
                                    "Test with 3+ people",
                                    "Document their reactions",
                                    "Iterate based on feedback"
                                ],
                                time: "2.5 hours"
                            },
                            weekend: {
                                title: "Polish & Document",
                                tasks: [
                                    "Create final demo video",
                                    "Write behavior documentation",
                                    "Prepare for Month 2"
                                ],
                                time: "4 hours"
                            }
                        },
                        engineersCorner: {
                            topics: [
                                "Finite State Machines (FSM) in robotics",
                                "Sensor fusion basics",
                                "Noise filtering: moving averages, Kalman intro",
                                "Interrupt-driven vs polling sensor reading"
                            ],
                            resources: [
                                "State Machines - Computerphile",
                                "Arduino Sensor Fusion Tutorial",
                                "Simple Kalman Filter explained"
                            ]
                        },
                        reflection: [
                            "How did sensors change your robot's 'aliveness'?",
                            "Which behaviors got the strongest emotional responses?",
                            "What's the minimum needed for something to feel 'aware'?",
                            "Design challenge: Express 'loneliness' through movement"
                        ],
                        resources: [
                            "Braitenberg Vehicles (simple behavioral robots)",
                            "Arduino Sensor Kit Documentation",
                            "Designing Sociable Robots - Chapter 3"
                        ]
                    },
                    {
                        id: "week3",
                        title: "Week 3: Character Development",
                        theme: "Personality through motion design",
                        days: {
                            monday: {
                                title: "Movement Vocabulary",
                                tasks: [
                                    "Create 20 distinct micro-movements",
                                    "Name each movement (peek, shake, nod, etc.)",
                                    "Chain movements into sequences"
                                ],
                                time: "2.5 hours"
                            },
                            tuesday: {
                                title: "Emotional Arc",
                                tasks: [
                                    "Program a 'wake up' sequence",
                                    "Create 'get excited' buildup",
                                    "Design 'wind down to sleep' routine"
                                ],
                                time: "2 hours"
                            },
                            wednesday: {
                                title: "Interactive Storytelling",
                                tasks: [
                                    "Script a 1-minute interaction scenario",
                                    "Program responses for each story beat",
                                    "Add sound effects or music"
                                ],
                                time: "2.5 hours"
                            },
                            thursday: {
                                title: "Polish and Timing",
                                tasks: [
                                    "Apply animation principles (ease-in/out)",
                                    "Adjust timing for comedy/drama",
                                    "Add anticipation movements"
                                ],
                                time: "2 hours"
                            },
                            friday: {
                                title: "Performance Testing",
                                tasks: [
                                    "Run through complete interaction 5 times",
                                    "Film best performance",
                                    "Get feedback from online community"
                                ],
                                time: "2.5 hours"
                            },
                            weekend: {
                                title: "Month 1 Showcase",
                                tasks: [
                                    "Create portfolio page for project",
                                    "Write design process story",
                                    "Plan Month 2 soft robotics project"
                                ],
                                time: "4 hours"
                            }
                        },
                        engineersCorner: {
                            topics: [
                                "Bezier curves for smooth motion",
                                "Inverse kinematics basics (2-DOF)",
                                "PID control introduction",
                                "Real-time systems and timing"
                            ],
                            resources: [
                                "Coding Train - Bezier Curves",
                                "Simple 2-DOF IK Tutorial",
                                "PID Without a PhD"
                            ]
                        },
                        reflection: [
                            "What makes movement feel 'alive' vs 'mechanical'?",
                            "How does timing change emotional impact?",
                            "What's your robot's core personality trait?",
                            "Plan: How will soft materials enhance expression?"
                        ],
                        resources: [
                            "Disney's 12 Principles of Animation",
                            "Pixar in a Box - Animation",
                            "The Illusion of Life excerpts"
                        ]
                    },
                    {
                        id: "week4",
                        title: "Week 4: Final Polish & Transition",
                        theme: "Portfolio piece & soft robotics prep",
                        days: {
                            monday: {
                                title: "Design Refinement",
                                tasks: [
                                    "Redesign shell/skin for better aesthetics",
                                    "Add final touches (eyes, details)",
                                    "Document design evolution"
                                ],
                                time: "2.5 hours"
                            },
                            tuesday: {
                                title: "Code Cleanup",
                                tasks: [
                                    "Organize code with clear comments",
                                    "Create behavior library",
                                    "Upload to GitHub"
                                ],
                                time: "2 hours"
                            },
                            wednesday: {
                                title: "Professional Documentation",
                                tasks: [
                                    "Shoot high-quality photos",
                                    "Create technical drawings",
                                    "Write build instructions"
                                ],
                                time: "2.5 hours"
                            },
                            thursday: {
                                title: "Soft Robotics Research",
                                tasks: [
                                    "Explore Soft Robotics Toolkit",
                                    "Order materials for Month 2",
                                    "Sketch soft robot concepts"
                                ],
                                time: "2 hours"
                            },
                            friday: {
                                title: "Community Sharing",
                                tasks: [
                                    "Post project to reddit/forums",
                                    "Respond to feedback",
                                    "Connect with other builders"
                                ],
                                time: "2.5 hours"
                            },
                            weekend: {
                                title: "Month 1 Retrospective",
                                tasks: [
                                    "Review all work from Month 1",
                                    "Identify top 3 learnings",
                                    "Set goals for Month 2"
                                ],
                                time: "3 hours"
                            }
                        },
                        engineersCorner: {
                            topics: [
                                "Introduction to soft robotics",
                                "Pneumatic vs tendon actuation",
                                "Compliant mechanisms",
                                "Material properties for robotics"
                            ],
                            resources: [
                                "Soft Robotics Toolkit - Harvard",
                                "Compliant Mechanisms - BYU Course",
                                "Soft Robotics Inc. videos"
                            ]
                        },
                        reflection: [
                            "What aspects of hard robotics limited expression?",
                            "How might soft materials enable new interactions?",
                            "What would you do differently starting over?",
                            "What are you most proud of from Month 1?"
                        ],
                        resources: [
                            "Soft Robotics journal - free articles",
                            "DIY Soft Robots - Instructables",
                            "Bio-inspired Soft Robotics - YouTube playlist"
                        ]
                    }
                ]
            },
            month2: {
                title: "Month 2: Soft & Safe",
                theme: "Robots You Want to Hug",
                weeks: [
                    {
                        id: "week5",
                        title: "Week 5: Introduction to Soft Mechanisms",
                        theme: "Fabric, tendons, and compliance",
                        days: {
                            monday: {
                                title: "Soft Material Exploration",
                                tasks: [
                                    "Test 5 different soft materials",
                                    "Document stretch, recovery, and feel",
                                    "Create material sample board"
                                ],
                                time: "2.5 hours"
                            },
                            tuesday: {
                                title: "Tendon-Driven Finger",
                                tasks: [
                                    "Build fabric/foam finger with fishing line",
                                    "Add servo for tendon control",
                                    "Test gripping soft objects"
                                ],
                                time: "2.5 hours"
                            },
                            wednesday: {
                                title: "Soft Bending Actuator",
                                tasks: [
                                    "Create accordion-fold actuator",
                                    "Test with manual air pressure",
                                    "Document bending angles"
                                ],
                                time: "2.5 hours"
                            },
                            thursday: {
                                title: "Living Hinges",
                                tasks: [
                                    "Design 3 living hinge patterns",
                                    "3D print or laser cut samples",
                                    "Test flexibility and durability"
                                ],
                                time: "2 hours"
                            },
                            friday: {
                                title: "Combine Techniques",
                                tasks: [
                                    "Design hybrid soft-rigid gripper",
                                    "Build first prototype",
                                    "Test with various objects"
                                ],
                                time: "2.5 hours"
                            },
                            weekend: {
                                title: "Soft Hand Project",
                                tasks: [
                                    "Build 3-finger soft hand",
                                    "Add wrist rotation",
                                    "Create grasp demonstrations"
                                ],
                                time: "4 hours"
                            }
                        },
                        engineersCorner: {
                            topics: [
                                "Continuum robotics theory",
                                "Pneumatic system basics",
                                "Stress-strain relationships",
                                "FEA for soft materials"
                            ],
                            resources: [
                                "Soft Robotics - Nature Review",
                                "Pneumatic Networks paper",
                                "FEA in Fusion 360 tutorial"
                            ]
                        },
                        reflection: [
                            "How do soft materials change user perception?",
                            "What movements are unique to soft robots?",
                            "How does compliance affect control?",
                            "Sketch a soft robot that expresses 'comfort'"
                        ],
                        resources: [
                            "Soft Robotics Toolkit - Actuators",
                            "Smooth-On silicone guide",
                            "Origami-inspired robotics"
                        ]
                    },
                    {
                        id: "week6",
                        title: "Week 6: Pneumatic Soft Robotics",
                        theme: "Air-powered gentle movement",
                        days: {
                            monday: {
                                title: "Silicone Molding Basics",
                                tasks: [
                                    "Create simple mold for actuator",
                                    "Mix and pour silicone (Ecoflex 00-30)",
                                    "Learn about cure times and bubbles"
                                ],
                                time: "3 hours"
                            },
                            tuesday: {
                                title: "Pneumatic Control",
                                tasks: [
                                    "Set up air pump and valves",
                                    "Control with Arduino and transistors",
                                    "Create inflation/deflation cycles"
                                ],
                                time: "2.5 hours"
                            },
                            wednesday: {
                                title: "Multi-Chamber Design",
                                tasks: [
                                    "Design actuator with 3 chambers",
                                    "Cast multi-chamber design",
                                    "Test sequential inflation"
                                ],
                                time: "3 hours"
                            },
                            thursday: {
                                title: "Soft Sensor Integration",
                                tasks: [
                                    "Add flex sensors to actuator",
                                    "Create pressure feedback loop",
                                    "Map sensor data to movement"
                                ],
                                time: "2 hours"
                            },
                            friday: {
                                title: "Breathing Robot",
                                tasks: [
                                    "Design 'breathing' torso/creature",
                                    "Program natural breathing rhythm",
                                    "Add response to touch"
                                ],
                                time: "2.5 hours"
                            },
                            weekend: {
                                title: "Soft Robot Character",
                                tasks: [
                                    "Combine week's techniques",
                                    "Create expressive soft character",
                                    "Film interaction demonstrations"
                                ],
                                time: "5 hours"
                            }
                        },
                        engineersCorner: {
                            topics: [
                                "Fluid dynamics in soft chambers",
                                "Hyperelastic material models",
                                "Control of soft actuators",
                                "Bio-inspired soft robotics"
                            ],
                            resources: [
                                "Whitesides Group papers",
                                "Soft actuator modeling - MATLAB",
                                "Bio-inspired soft robots - Science"
                            ]
                        },
                        reflection: [
                            "How does 'breathing' affect emotional connection?",
                            "What's the ideal balance of soft/rigid?",
                            "How do people naturally interact with soft robots?",
                            "Design a soft robot that invites touch"
                        ],
                        resources: [
                            "PneuNets tutorial",
                            "Soft gripper designs - GitHub",
                            "Disney Research soft robotics"
                        ]
                    }
                ]
            },
            // Continue with months 3-6...
        };

        // Add more months (I'll add abbreviated versions for space)
        curriculum.month3 = {
            title: "Month 3: Expressive Motion",
            theme: "Motion as Communication",
            weeks: [
                {
                    id: "week9",
                    title: "Week 9: Mechanical Poetry",
                    theme: "Smooth, organic movement",
                    days: {
                        monday: { title: "Multi-DOF Mechanisms", tasks: ["Design 3-DOF arm", "Build with precise bearings", "Test range of motion"], time: "2.5 hours" },
                        tuesday: { title: "Motion Profiles", tasks: ["Implement sine wave movements", "Create acceleration curves", "Test different easing functions"], time: "2 hours" },
                        wednesday: { title: "Inverse Kinematics", tasks: ["Use IKPY library for Python", "Create reaching behaviors", "Test workspace limits"], time: "2.5 hours" },
                        thursday: { title: "Gesture Library", tasks: ["Design 20 expressive gestures", "Program smooth transitions", "Create gesture sequencer"], time: "2 hours" },
                        friday: { title: "Lamp Character", tasks: ["Mount mechanism as desk lamp", "Program personality behaviors", "Add interaction triggers"], time: "2.5 hours" },
                        weekend: { title: "Animation Study", tasks: ["Study Pixar lamp reference", "Recreate classic animations", "Create original performance"], time: "4 hours" }
                    },
                    engineersCorner: {
                        topics: ["Forward/Inverse kinematics", "Trajectory planning", "Jacobian matrices", "Motion interpolation"],
                        resources: ["Modern Robotics course", "IKPY documentation", "Robotics Toolbox for Python"]
                    },
                    reflection: [
                        "How does smooth motion affect perceived intelligence?",
                        "What gestures are universally understood?",
                        "How can constraints create character?",
                        "Animate 'thinking' without a face"
                    ]
                },
                {
                    id: "week10",
                    title: "Week 10: Computer Vision Integration",
                    theme: "Seeing and responding",
                    days: {
                        monday: { title: "OpenCV Setup", tasks: ["Install OpenCV for Python", "Test with webcam", "Detect faces and objects"], time: "2.5 hours" },
                        tuesday: { title: "Tracking Behaviors", tasks: ["Implement face tracking", "Create smooth following motion", "Add 'lost person' behavior"], time: "2 hours" }
                    },
                    engineersCorner: {
                        topics: ["Computer vision basics", "Color spaces and filtering", "Object detection algorithms", "Real-time processing"],
                        resources: ["OpenCV tutorials", "PyImageSearch blog", "Two Minute Papers - CV"]
                    }
                }
            ]
        };

        curriculum.month4 = {
            title: "Month 4: Walking & Dancing",
            theme: "Rhythmic Robotics",
            weeks: [
                {
                    id: "week13",
                    title: "Week 13: Legged Locomotion Basics",
                    theme: "Making things walk",
                    days: {
                        monday: { title: "Leg Mechanism Design", tasks: ["Study different leg designs", "Build 2-DOF leg prototype", "Test with manual control"], time: "2.5 hours" }
                    },
                    engineersCorner: {
                        topics: ["Gait patterns", "Static vs dynamic stability", "Zero Moment Point", "Central Pattern Generators"],
                        resources: ["MIT Mini Cheetah papers", "OpenDog project", "Walking robot basics - YouTube"]
                    }
                }
            ]
        };

        curriculum.month5 = {
            title: "Month 5: Smart Interactions",
            theme: "Meaningful Connections",
            weeks: [
                {
                    id: "week17",
                    title: "Week 17: Machine Learning for Robots",
                    theme: "Teaching robots to learn",
                    days: {
                        monday: { title: "Edge Impulse Setup", tasks: ["Create Edge Impulse account", "Collect gesture data", "Train first model"], time: "2.5 hours" }
                    },
                    engineersCorner: {
                        topics: ["ML basics for robotics", "Neural networks intro", "Reinforcement learning concepts", "Edge computing"],
                        resources: ["Fast.ai course", "Edge Impulse docs", "TensorFlow Lite for Microcontrollers"]
                    }
                }
            ]
        };

        curriculum.month6 = {
            title: "Month 6: Signature Project",
            theme: "Your Vision Realized",
            weeks: [
                {
                    id: "week21",
                    title: "Week 21: Project Planning",
                    theme: "Defining your masterpiece",
                    days: {
                        monday: { title: "Concept Development", tasks: ["Create project proposal", "Define success criteria", "Plan timeline"], time: "3 hours" }
                    },
                    engineersCorner: {
                        topics: ["Project management", "System integration", "Testing methodologies", "Documentation best practices"],
                        resources: ["Agile for hardware", "System design interviews", "Portfolio presentation tips"]
                    }
                }
            ]
        };

        // Main App Component
        function App() {
            const [selectedMonth, setSelectedMonth] = useState('month1');
            const [selectedWeek, setSelectedWeek] = useState('week1');
            const [completedTasks, setCompletedTasks] = useState({});
            const [engineerCornerOpen, setEngineerCornerOpen] = useState({});
            const [journalEntries, setJournalEntries] = useState({});
            const [currentJournal, setCurrentJournal] = useState('');

            useEffect(() => {
                // Load saved progress from localStorage
                const saved = localStorage.getItem('roboticsProgress');
                if (saved) {
                    const data = JSON.parse(saved);
                    setCompletedTasks(data.completedTasks || {});
                    setJournalEntries(data.journalEntries || {});
                }
            }, []);

            const saveProgress = () => {
                localStorage.setItem('roboticsProgress', JSON.stringify({
                    completedTasks,
                    journalEntries: { ...journalEntries, [selectedWeek]: currentJournal }
                }));
                alert('Progress saved! 🎉');
            };

            const toggleTask = (taskId) => {
                setCompletedTasks(prev => ({
                    ...prev,
                    [taskId]: !prev[taskId]
                }));
            };

            const toggleEngineerCorner = (weekId) => {
                setEngineerCornerOpen(prev => ({
                    ...prev,
                    [weekId]: !prev[weekId]
                }));
            };

            const calculateProgress = () => {
                const totalTasks = Object.keys(completedTasks).length || 1;
                const completed = Object.values(completedTasks).filter(Boolean).length;
                return Math.round((completed / Math.max(totalTasks, 1)) * 100);
            };

            const currentMonth = curriculum[selectedMonth];
            const currentWeek = currentMonth?.weeks?.find(w => w.id === selectedWeek) || currentMonth?.weeks?.[0];

            useEffect(() => {
                if (journalEntries[selectedWeek]) {
                    setCurrentJournal(journalEntries[selectedWeek]);
                } else {
                    setCurrentJournal('');
                }
            }, [selectedWeek, journalEntries]);

            return (
                <div className="app-container">
                    <div className="header">
                        <h1>🤖 Robotics Learning Journey</h1>
                        <p>From Designer to Robotics Creator - Your Daily Companion</p>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${calculateProgress()}%` }}></div>
                        </div>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-value">{calculateProgress()}%</div>
                                <div className="stat-label">Overall Progress</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{Object.values(completedTasks).filter(Boolean).length}</div>
                                <div className="stat-label">Tasks Completed</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{Object.keys(journalEntries).length}</div>
                                <div className="stat-label">Journal Entries</div>
                            </div>
                        </div>
                    </div>

                    <div className="main-content">
                        <div className="sidebar">
                            <div className="month-selector">
                                <h3>Select Month</h3>
                                {Object.keys(curriculum).map(monthKey => (
                                    <button
                                        key={monthKey}
                                        className={`month-btn ${selectedMonth === monthKey ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedMonth(monthKey);
                                            setSelectedWeek(curriculum[monthKey].weeks[0].id);
                                        }}
                                    >
                                        {curriculum[monthKey].title}
                                    </button>
                                ))}
                            </div>

                            <div className="week-list">
                                <h3>Weeks</h3>
                                {currentMonth?.weeks?.map(week => (
                                    <button
                                        key={week.id}
                                        className={`week-btn ${selectedWeek === week.id ? 'active' : ''}`}
                                        onClick={() => setSelectedWeek(week.id)}
                                    >
                                        {week.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="content-area">
                            {currentWeek && (
                                <>
                                    <div className="week-header">
                                        <h2 className="week-title">{currentWeek.title}</h2>
                                        <p className="week-theme">{currentWeek.theme}</p>
                                    </div>

                                    <div className="daily-tasks">
                                        <h3>Daily Tasks</h3>
                                        {Object.entries(currentWeek.days).map(([day, dayData]) => (
                                            <div key={day} className="day-section">
                                                <div className="day-header">
                                                    <span className="day-title">
                                                        {day.charAt(0).toUpperCase() + day.slice(1)}: {dayData.title}
                                                    </span>
                                                    <span className="badge badge-new">{dayData.time}</span>
                                                </div>
                                                <ul className="task-list">
                                                    {dayData.tasks.map((task, idx) => {
                                                        const taskId = `${selectedWeek}-${day}-${idx}`;
                                                        return (
                                                            <li key={idx} className="task-item">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={completedTasks[taskId] || false}
                                                                    onChange={() => toggleTask(taskId)}
                                                                />
                                                                <span>{task}</span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="engineers-corner">
                                        <div 
                                            className="corner-header" 
                                            onClick={() => toggleEngineerCorner(selectedWeek)}
                                        >
                                            <span className="corner-title">
                                                <span className={`toggle-arrow ${engineerCornerOpen[selectedWeek] ? 'open' : ''}`}>▶</span>
                                                🔧 Engineer's Corner
                                                <span className="badge badge-optional">Optional</span>
                                            </span>
                                        </div>
                                        {engineerCornerOpen[selectedWeek] && currentWeek.engineersCorner && (
                                            <div className="corner-content">
                                                <h4>Advanced Topics:</h4>
                                                <ul>
                                                    {currentWeek.engineersCorner.topics.map((topic, idx) => (
                                                        <li key={idx}>{topic}</li>
                                                    ))}
                                                </ul>
                                                <h4>Resources:</h4>
                                                {currentWeek.engineersCorner.resources.map((resource, idx) => (
                                                    <a key={idx} href="#" className="resource-link">
                                                        {resource}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {currentWeek.resources && (
                                        <div className="resources-section">
                                            <h3>📚 Week Resources</h3>
                                            {currentWeek.resources.map((resource, idx) => (
                                                <a key={idx} href="#" className="resource-link">
                                                    {resource}
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    <div className="reflection-section">
                                        <h3 className="reflection-title">
                                            💭 Reflection & Journal
                                        </h3>
                                        {currentWeek.reflection && currentWeek.reflection.map((prompt, idx) => (
                                            <div key={idx} className="reflection-prompt">
                                                {prompt}
                                            </div>
                                        ))}
                                        <textarea
                                            className="journal-textarea"
                                            placeholder="Write your thoughts, learnings, and ideas here..."
                                            value={currentJournal}
                                            onChange={(e) => setCurrentJournal(e.target.value)}
                                        />
                                        <button className="save-btn" onClick={saveProgress}>
                                            Save Progress & Journal
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>
