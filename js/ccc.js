// DOM Elements
const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const chatArea = document.querySelector('.chat-area'); // Chat area container
const robotImage = document.querySelector('.image img'); // Robot image
const voiceSelect = document.querySelector('.voice-select'); // Dropdown for voice selection

let userName = localStorage.getItem('userName') || ''; // Load user's name from localStorage
let voices = [];
let currentVoice = null;
let currentVoiceType = "male"; // Default voice type

// Load available voices
function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    console.log("Available voices:", voices); // Log available voices

    // Populate the voice selection dropdown
    voiceSelect.innerHTML = voices.map(voice => `<option value="${voice.name}">${voice.name}</option>`).join('');
    currentVoice = voices.find(voice => voice.name.toLowerCase().includes(currentVoiceType)) || voices[0]; // Default to first voice if none match
    voiceSelect.value = currentVoice.name; // Set the dropdown value
}

// Update current voice based on selection
voiceSelect.addEventListener('change', () => {
    currentVoice = voices.find(voice => voice.name === voiceSelect.value) || voices[0];
    console.log("Current voice:", currentVoice); // Log the selected voice
});

// Function to speak a text
function speak(text) {
    // Stop any ongoing speech
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel(); // Stop any ongoing speech synthesis
    }

    console.log("Speaking:", text); // Log the text being spoken
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = currentVoice;

    robotImage.classList.add('speaking'); // Speaking animation
    window.speechSynthesis.speak(utterance);

    // Display the bot's text response
    const botMessage = document.createElement('div');
    botMessage.classList.add('message', 'bot-message'); // Add classes for styling
    botMessage.textContent = `SYNEXIA: ${text}`;
    chatArea.appendChild(botMessage); // Append to the chat area
    chatArea.scrollTop = chatArea.scrollHeight; // Scroll to the bottom

    utterance.onend = () => {
        robotImage.classList.remove('speaking');
        console.log("Speech has ended."); // Log when speech ends
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

// Fetch response from Gemini API
const API_KEY = 'AIzaSyCwgVE0ZD5OzGvzxf91bqoM8jD3wunVLes'; // Replace with your actual API key
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

// Fetch response from the API based on user message
async function fetchGeminiResponse(userMessage) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                contents: [{ 
                    role: "user", 
                    parts: [{ text: userMessage }] 
                }] 
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        // Get the API response text and remove asterisks from it
        const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
        return apiResponse || "I'm sorry, I couldn't find relevant information.";
    } catch (error) {
        console.error("Error fetching data from Gemini API:", error);
        return "I'm experiencing technical issues. Please try again later.";
    }
}

// Commands to handle user requests
const commands = {
    "my name is": (query) => {
        const name = query.replace("my name is", "").trim();
        userName = name;
        localStorage.setItem('userName', userName);
        speak(`Nice to meet you, ${userName}!`);
        greetUser();
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
    "who is your creator": () => {
        const creatorResponse = "I was created by Shinaayomi, most people know him as Tee Shine, the CEO and founder of NexaTech. But I'm using the Gemini API to fetch some data.";
        speak(creatorResponse);
    },
    // Mode switching
    "light mode": () => {
        document.body.style.background = "white";
        document.body.style.color = "black";
        speak("Switched to light mode.");
    },
    "dark mode": () => {
        document.body.style.background = "#0f0e0e";
        document.querySelector('.container').style.color = "white"
        document.body.style.color = "white";
        speak("Switched to dark mode.");
    },
};

// Handle speech recognition results
recognition.onresult = async (event) => {
    const query = event.results[0][0].transcript.toLowerCase().trim();
    const userMessage = document.createElement('div');
    userMessage.classList.add('message', 'user-message'); // Add classes for styling
    userMessage.textContent = `You: ${query}`;
    chatArea.appendChild(userMessage); // Append to the chat area
    chatArea.scrollTop = chatArea.scrollHeight; // Scroll to the bottom

    // Log the query sent to API
    console.log("Query sent to API:", query);

    // Check if any command matches the user's query
    let commandFound = false;
    for (let cmd in commands) {
        if (query.includes(cmd)) {
            commandFound = true;
            commands[cmd](query);
            break;
        }
    }

    // If no command is found, send query to the Gemini API
    if (!commandFound) {
        const loadingMessage = "Fetching your answer...";
        const loadingElement = document.createElement('div');
        loadingElement.classList.add('message', 'loading-message'); // Add classes for styling
        loadingElement.textContent = loadingMessage;
        chatArea.appendChild(loadingElement); // Append to the chat area
        chatArea.scrollTop = chatArea.scrollHeight; // Scroll to the bottom

        const apiResponse = await fetchGeminiResponse(query);
        chatArea.removeChild(loadingElement); // Remove loading message
        speak(apiResponse); // Speak the response after fetching it
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
    speak("Initializing SYNEXIA...");
    askForName(); // Always ask for the user's name on page load
});
