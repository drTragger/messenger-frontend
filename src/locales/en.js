export default {
    login: {
        title: 'Login to {appName}',
        subtitle: 'Access your account',
        button: 'Login',
        noAccount: "Don't have an account?",
        logout: 'Logout',
        form: {
            phone: {
                label: 'Phone',
            },
            password: {
                label: 'Password',
                placeholder: 'Enter your password',
            },
        },
    },
    register: {
        title: 'Create an Account',
        subtitle: 'Join {appName} today!',
        button: 'Register',
        haveAccount: 'Already have an account?',
        form: {
            username: {
                label: 'Username',
                placeholder: 'Enter your username',
            },
            phone: {
                label: 'Phone',
            },
            password: {
                label: 'Password',
                placeholder: 'Enter your password',
            },
        },
    },
    phoneVerify: {
        title: "Phone Verification",
        subtitle: "Let's get in touch!",
        instructions: "Enter the code sent to",
        resend: "Resend Code",
        resendHint: "You can resend the code in {count} second. | You can resend the code in {count} seconds.",
        submit: "Verify Code",
        success: "Phone successfully verified.",
        error: "Invalid or expired code. Please try again."
    },
    home: {
        subtitle: 'Your personal messaging space',
    },
    chat: {
        title: "Chat | Chats",
        lastSeen: "Last seen",
        online: "Online",
        searchUsers: "Search for users...",
        empty: {
            title: 'No chats yet',
            subtitle: 'Start a conversation by finding your new chat partner.',
        },
        lastMessage: {
            empty: 'No messages yet',
        },
        message: {
            type: "Type your message...",
            loading: "Loading messages...",
            edited: "Edited",
            notification: "New message from {username}"
        },
        emoji: {
            placeholder: "Search emoji",
            skinTone: "Skin tone",
            groups: {
                recent: "Recently used",
                smileysPeople: "Smiles & People",
                animalsNature: "Animals & Nature",
                foodDrink: "Food & Drink",
                activities: "Activities",
                travelPlaces: "Travel places",
                objects: "Objects",
                symbols: "Symbols",
                flags: "Flags"
            }
        },
        contextMenu: {
            copy: "Copy",
            edit: "Edit",
            delete: "Delete",
            reply: "Reply"
        }
    },
    messages: {
        empty: {
            title: 'No messages yet',
            subtitle: 'Start a conversation by sending a message to your chat partner.'
        },
        sender: 'Sender',
    },
    settings: {
        title: 'Settings',
        subtitle: 'Manage your account and preferences',
        profilePicture: {
            title: 'Profile picture',
            hint: 'Click to upload a new profile picture',
            resize: "Resize Profile Picture",
        },
        personalInfo: {
            title: 'Personal information',
            button: 'Save changes',
            name: {
                label: 'Name',
                placeholder: 'Enter your name',
            },
        },
        language: 'Choose your language',
        logout: 'Log out of the system'
    },
    validation: {
        required: 'Please fill this field',
        phone: {
            invalid: 'The phone number is invalid.',
        },
    },
    errors: {
        unexpected: 'An unexpected error occurred. Please try again.',
    },
    loading: "Loading...",
    notAvailable: "Not available",
    save: "Save",
    cancel: "Cancel",
    countries: {
        ua: 'Ukraine',
        us: 'United States',
        pl: 'Poland',
        searchPlaceholder: 'Search',
    },
};