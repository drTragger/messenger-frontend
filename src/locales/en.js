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
            attachmentOnly: 'Attachment',
        },
        message: {
            type: "Type your message...",
            loading: "Loading messages...",
            edited: "Edited",
            notification: "New message from {username}"
        },
        attachments: {
            caption: 'Add a caption...',
            add: 'Add',
            popover: {
                imageVideo: 'Upload Image/Video',
                file: 'Upload File',
                formats: 'Supports {formats} formats',
            },
            preview: 'Preview uploaded files',
            empty: 'No files selected',
            video: {
                noSupport: 'Your browser does not support the video tag.',
            }
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
            readAt: {
                today: 'Today at {time}',
                yesterday: 'Yesterday at {time}',
            },
            copy: "Copy",
            edit: "Edit",
            delete: "Delete",
            reply: "Reply",
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
            success: 'Profile picture updated successfully.'
        },
        personalInfo: {
            title: 'Personal information',
            button: 'Save changes',
            success: 'Personal information updated successfully.',
            firstName: {
                label: 'First Name',
                placeholder: 'Enter your first name',
            },
            lastName: {
                label: 'Last Name',
                placeholder: 'Enter your last name',
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
        message: {
            send: 'Failed to send a message. Please, try again.',
            edit: 'Failed to edit a message. Please, try again.',
        },
    },
    toast: {
        summary: {
            success: 'Success',
            error: 'Error',
        },
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