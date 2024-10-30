// DOM Elements
const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const robotImage = document.querySelector('.image img'); // Robot image
const userTextDisplay = document.createElement('div'); // Display user's text
const botTextDisplay = document.createElement('div'); // Display bot's text

content.appendChild(userTextDisplay);
content.appendChild(botTextDisplay);

let userName = localStorage.getItem('userName') || ''; // Load user's name from localStorage
let tasks = [];
let voices = [];
let currentVoice = null;
let currentVoiceType = "male"; // Default voice type

// Load available voices
function loadVoices() {
    voices = window.speechSynthesis.getVoices();

    // Set default voice based on current voice type
    currentVoice = voices.find(voice => {
        return (
            (currentVoiceType === "female" && voice.name.toLowerCase().includes('female')) ||
            (currentVoiceType === "male" && voice.name.toLowerCase().includes('male')) ||
            (currentVoiceType === "child" && voice.name.toLowerCase().includes('child')) ||
            voice.lang === 'en' // Fallback to English if no match
        );
    }) || voices[0]; // Default to first voice if none match
}

// Function to speak text
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = currentVoice;

    robotImage.classList.add('speaking'); // Speaking animation
    window.speechSynthesis.speak(utterance);

    // Display the bot's text response
    botTextDisplay.textContent = `SYNEXIA: ${text}`;
    botTextDisplay.style.color = '#28a745'; // Bot text color

    utterance.onend = () => {
        robotImage.classList.remove('speaking');
    };
}

// Greet the user
function greetUser() {
    const hour = new Date().getHours();
    let greeting;

    if (userName) {
        if (hour < 12) {
            greeting = `Good Morning, ${userName}! Welcome back!`;
        } else if (hour < 18) {
            greeting = `Good Afternoon, ${userName}! Welcome back!`;
        } else {
            greeting = `Good Evening, ${userName}! Welcome back!`;
        }
    } else {
        askForName();
        return; // Exit if asking for name
    }

    speak(greeting);
}

// Ask for user's name
function askForName() {
    speak("Hello! What's your name?");
}

// Initialize Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;

// Commands to handle user requests
const commands = {
    "my name is": (query) => {
        const name = query.replace("my name is", "").trim();
        userName = name;
        localStorage.setItem('userName', userName);
        speak(`Nice to meet you, ${userName}!`);
        greetUser(); // Welcome the user after saving the name
    },
    "hello": () => speak("Hello! How can I help you today?"),
    "search": (query) => {
        const searchQuery = query.replace("search", "").trim();
        if (searchQuery) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
            speak(`Searching for ${searchQuery} on Google.`);
        } else {
            speak("What would you like to search for?");
        }
    },
    "who is your creator": () => speak("I was created by a team of developers passionate about AI."),
    "who is god": () => speak("God is often described as the supreme being in many religions."),
    "are you a human being": () => speak("No, I am a virtual assistant, not a human being."),
    "what can you do": () => speak("I can assist you with tasks, answer questions, and provide information."),
    "tell me about yourself": () => speak("I am NEXABOT, your personal virtual assistant here to help you."),
    "what is your purpose": () => speak("My purpose is to assist you and make your life easier."),
    "What can you do": () => speak("I can solve most of your software problems for you"),
    "change voice to female": () => {
        currentVoiceType = "female";
        loadVoices();
        speak("Changed my voice to female.");
    },
    "change voice to male": () => {
        currentVoiceType = "male";
        loadVoices();
        speak("Changed my voice to male.");
    },
    "change voice to child": () => {
        currentVoiceType = "child"; // Specify how you categorize the child voice
        loadVoices();
        speak("Changed my voice to a child.");
    },
    "show my tasks": () => {
        if (tasks.length > 0) {
            speak(`Your tasks are: ${tasks.join(", ")}`);
        } else {
            speak("You have no tasks in your list.");
        }
    },
    "add task": (query) => {
        const taskDescription = query.replace("add task", "").trim();
        tasks.push(taskDescription);
        speak(`Added task: ${taskDescription}`);
    },
    "delete task": (query) => {
        const taskDescription = query.replace("delete task", "").trim();
        const taskIndex = tasks.findIndex(task => task.toLowerCase() === taskDescription.toLowerCase());
        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
            speak(`Deleted task: ${taskDescription}`);
        } else {
            speak("Task not found in your list.");
        }
    },
    // Placeholder for weather request
    "what's the weather in": (query) => {
        const location = query.replace("what's the weather in", "").trim();
        speak(`Fetching weather for ${location}...`);
    },
     // Music and web control
     "open youtube": () => {
        window.open("https://youtube.com", "_blank");
        speak("Opening YouTube...");
    },
    "play music": () => {
        speak("Playing music from your system...");
        // Implement local music play here
    },
    "open facebook": () => {
        window.open("https://facebook.com", "_blank");
        speak("Opening Facebook...");
    },
    "open calculator": () => {
        window.open("Calculator:///", "_blank"); // Assuming your browser can open the calculator this way
        speak("Opening Calculator...");
    },
    "open google": () => {
        window.open("https://google.com", "_blank");
        speak("Opening Google...");
    },
    // Mode switching
    "light mode": () => {
        document.body.style.background = "white";
        document.body.style.color = "black";
        speak("Switched to light mode.");
    },
    "dark mode": () => {
        document.body.style.background = "#0f0e0e";
        document.body.style.color = "white";
        speak("Switched to dark mode.");
    },
    "tell me a joke": () => {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Why did the math book look sad? It had too many problems.",
            "Why did the scarecrow win an award? Because he was outstanding in his field!"
        ];
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        speak(randomJoke);
    }
};

// Handle speech recognition results
recognition.onresult = (event) => {
    const query = event.results[0][0].transcript.toLowerCase().trim();
    userTextDisplay.textContent = `You: ${query}`;
    userTextDisplay.style.color = '#17a2b8'; // User text color

    // Check if any command matches the user's query
    let commandFound = false;
    for (let cmd in commands) {
        if (query.includes(cmd)) {
            commandFound = true;
            commands[cmd](query);
            break;
        }
    }
    // If no command is found
    if (!commandFound) {
        speak("I'm sorry, I didn't understand that. Could you please repeat?");
    }
};

// Start listening for speech when the button is clicked
btn.addEventListener('click', () => {
    recognition.start();
    speak("Listening...");
});

// Load voices on page load
window.speechSynthesis.onvoiceschanged = loadVoices;

// Greet the user when the page loads
window.addEventListener('load', () => {
    speak("Initializing NEXABOT...");
    askForName(); // Always ask for the user's name on page load
});
