import {createI18n} from 'vue-i18n';

const messages = {
    en: {
        login: {
            title: 'Login to {appName}',
            subtitle: 'Access your account',
            button: 'Login',
            noAccount: "Don't have an account?",
            form: {
                phone: {
                    label: 'Phone',
                },
                password: {
                    label: 'Password',
                    placeholder: 'Enter your password'
                }
            }
        },
        register: {
            title: "Create an Account",
            subtitle: "Join {appName} today!",
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
                    placeholder: 'Enter your password'
                }
            }
        },
        validation: {
            phone: {
                invalid: 'The phone number is invalid'
            }
        },
        errors: {
            unexpected: "An unexpected error occurred. Please try again."
        },
        countries: {
            ua: 'Ukraine',
            us: 'United States',
            pl: 'Poland',
        }
    },
    uk: {
        login: {
            title: 'Входити до {appName}',
            subtitle: 'Увійдіт у свій ґаздівський аккаунт',
            button: 'Входити',
            noAccount: 'Не маєте аккаунту?',
            form: {
                phone: {
                    label: 'Телефон',
                },
                password: {
                    label: 'Пароль',
                    placeholder: 'Впишіт свій пароль'
                }
            }
        },
        register: {
            title: "Створити Аккаунт",
            subtitle: "Прийміться до {appName} прямо сьогодні!",
            button: 'Зареєстроватися',
            haveAccount: 'Вже маєте аккаунт?',
            form: {
                username: {
                    label: 'Імʼя ґазди',
                    placeholder: 'Впишіт імʼя ґазди',
                },
                phone: {
                    label: 'Телефон',
                },
                password: {
                    label: 'Пароль',
                    placeholder: 'Впишіт свій пароль'
                }
            }
        },
        validation: {
            phone: {
                invalid: 'Номер телефону, щось не в поряді'
            }
        },
        errors: {
            unexpected: "Сталася якась біда. Спробуйте наново."
        },
        countries: {
            ua: 'Україна',
            us: 'Америка',
            pl: 'Польща',
        }
    },
};

const i18n = createI18n({
    locale: 'uk', // Default locale
    fallbackLocale: 'uk', // Fallback if locale is missing
    messages,
});

export default i18n;