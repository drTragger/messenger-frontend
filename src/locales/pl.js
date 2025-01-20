export default {
    login: {
        title: 'Zaloguj się do {appName}',
        subtitle: 'Uzyskaj dostęp do swojego konta',
        button: 'Zaloguj się',
        noAccount: 'Nie masz konta?',
        logout: 'Wyloguj się',
        form: {
            phone: {
                label: 'Telefon',
            },
            password: {
                label: 'Hasło',
                placeholder: 'Wprowadź swoje hasło',
            },
        },
    },
    register: {
        title: 'Utwórz Konto',
        subtitle: 'Dołącz do {appName} już dziś!',
        button: 'Zarejestruj się',
        haveAccount: 'Masz już konto?',
        form: {
            username: {
                label: 'Nazwa użytkownika',
                placeholder: 'Wprowadź swoją nazwę użytkownika',
            },
            phone: {
                label: 'Telefon',
            },
            password: {
                label: 'Hasło',
                placeholder: 'Wprowadź swoje hasło',
            },
        },
    },
    phoneVerify: {
        title: "Weryfikacja Telefonu",
        subtitle: "Wpisz kod wysłany na numer",
        resend: "Wyślij Kod Ponownie",
        resendHint: "Możesz wysłać kod ponownie za {count} sekundę. | Możesz wysłać kod ponownie za {count} sekund.",
        submit: "Zweryfikuj Kod",
        success: "Telefon został pomyślnie zweryfikowany.",
        error: "Kod jest nieprawidłowy lub wygasł. Spróbuj ponownie."
    },
    home: {
        subtitle: 'Twoja osobista przestrzeń do rozmów',
    },
    chat: {
        title: "Czat | Czaty",
        lastSeen: "Ostatnio widziany",
        online: "Online",
        searchUsers: "Szukaj użytkowników...",
        empty: {
            title: 'Nie masz jeszcze żadnych czatów',
            subtitle: 'Rozpocznij rozmowę, znajdując nowego rozmówcę.',
        },
        lastMessage: {
            empty: 'Brak wiadomości. Napisz do swojego rozmówcy!',
        },
        message: {
            type: "Napisz wiadomość...",
            loading: "Ładowanie wiadomości...",
            edited: "Edytowano",
            notification: "Nowa wiadomość od {username}"
        },
        emoji: {
            placeholder: "Szukaj emoji",
            skinTone: "Kolor skóry",
            groups: {
                recent: "Ostatnio używane",
                smileysPeople: "Uśmiechy i Ludzie",
                animalsNature: "Zwierzęta i Natura",
                foodDrink: "Jedzenie i Napoje",
                activities: "Aktywności",
                travelPlaces: "Podróże i Miejsca",
                objects: "Obiekty",
                symbols: "Symbole",
                flags: "Flagi"
            }
        },
        contextMenu: {
            copy: "Kopiuj",
            edit: "Edytuj",
            delete: "Usuń",
            reply: "Odpowiedz"
        }
    },
    messages: {
        empty: {
            title: 'Brak wiadomości',
            subtitle: 'Rozpocznij rozmowę, wysyłając wiadomość do swojego rozmówcy.'
        },
        sender: 'Nadawca',
    },
    settings: {
        title: 'Ustawienia',
        subtitle: 'Zarządzaj swoim kontem i preferencjami',
        profilePicture: {
            title: 'Zdjęcie profilowe',
            hint: 'Kliknij, aby przesłać nowe zdjęcie profilowe',
            resize: "Dostosuj rozmiar zdjęcia profilowego",
        },
        personalInfo: {
            title: 'Informacje osobiste',
            button: 'Zapisz zmiany',
            firstName: {
                label: 'Imię',
                placeholder: 'Wprowadź swoje imię',
            },
        },
        language: 'Wybierz język',
        logout: 'Wyloguj się z systemu',
    },
    validation: {
        phone: {
            invalid: 'Numer telefonu jest nieprawidłowy.',
        },
    },
    errors: {
        unexpected: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
    },
    loading: "Ładowanie...",
    notAvailable: "Niedostępne",
    save: "Zapisz",
    cancel: "Anuluj",
    countries: {
        ua: 'Ukraina',
        us: 'Stany Zjednoczone',
        pl: 'Polska',
        searchPlaceholder: 'Szukaj',
    },
};