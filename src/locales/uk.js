export default {
    login: {
        title: 'Входити до {appName}',
        subtitle: 'Увійдіт у свій ґаздівський аккаунт',
        button: 'Входити',
        noAccount: 'Немаєте ґаздівського аккаунту?',
        logout: 'Вийти',
        form: {
            phone: {
                label: 'Телефон',
            },
            password: {
                label: 'Ключ',
                placeholder: 'Впишіт свій ключ',
            },
        },
    },
    register: {
        title: 'Створити Ґаздівський Аккаунт',
        subtitle: 'Ставайте ґаздою у {appName} нині!',
        button: 'Стати ґаздою',
        haveAccount: 'Є вже ґаздівський аккаунт?',
        form: {
            username: {
                label: 'Ґаздівське імʼя',
                placeholder: 'Впишіт ґаздівське імʼя',
            },
            phone: {
                label: 'Телефон',
            },
            password: {
                label: 'Ключ',
                placeholder: 'Впишіт свій ключ',
            },
        },
    },
    home: {
        subtitle: 'Твоє файне місце для ґаздівських балачок',
    },
    phoneVerify: {
        title: "Перевірка Телефону",
        subtitle: "Перевіримо, чи ви не злодій",
        instructions: "Введіт код, котрий вислали на номер",
        resend: "Переслати Код",
        resendHint: "Можете переслати код через {count} секунду. | Можете переслати код через {count} секунд.",
        submit: "Перевірити Код",
        success: "Телефон успішно перевірено.",
        error: "Код недійсний або прострочений. Спробуйте ще раз."
    },
    chat: {
        title: "Твоя говірка | Твої говірки",
        lastSeen: "Востаннє виділи о",
        online: "На звʼязку",
        searchUsers: "Шукай свого цімбора...",
        empty: {
            title: 'Єкось ни має балачок',
            subtitle: 'Почніт балачку, знайдіт собі нового співбесідника.',
        },
        lastMessage: {
            empty: 'То напиши вже цімбору і вйо!',
            attachmentOnly: 'Файлик',
        },
        message: {
            type: "Шо нового?",
            loading: "Чекайте, завантажую...",
            edited: "Відредаговано",
            notification: "Нове повідомлення від {username}"
        },
        attachments: {
            caption: 'Додати опис...',
            add: 'Додати',
            popover: {
                imageVideo: 'Засадити Світлину/Відео',
                file: 'Засадити Файлик',
                formats: 'Приймає формати {formats}',
            },
            preview: 'Подивити файли, що загружені',
            empty: 'Нема файлів, же би вибрані були',
            video: {
                noSupport: 'Твій браузір не підтримує відео-тег.',
            }
        },
        emoji: {
            placeholder: "Шукай пискляку",
            skinTone: "Барва шкіри",
            groups: {
                recent: "Недавно виджувані",
                smileysPeople: "Смії та люде",
                animalsNature: "Звірі та природа",
                foodDrink: "Їда та питво",
                activities: "Дії",
                travelPlaces: "Подорожі та місця",
                objects: "Речі",
                symbols: "Знаки",
                flags: "Прапори"
            }
        },
        contextMenu: {
            readAt: {
                today: 'Сьогодні о {time}',
                yesterday: 'Вчора о {time}',
            },
            copy: "Копі",
            edit: "Підправити",
            delete: "Викинути",
            reply: "Відказати"
        }
    },
    messages: {
        empty: {
            title: 'Єкось ни має повідань',
            subtitle: 'Почніт балачку, напишіт повіданє свому співбесіднику.'
        },
        sender: 'Відправник',
    },
    settings: {
        title: 'Налаштунки',
        subtitle: 'Керуй своїм рахунком і уподобаннями',
        profilePicture: {
            title: 'Світлина профілю',
            hint: 'Клікни, аби закачати нову світлину до профілю',
            resize: "Відміряй світлину профілю",
            success: 'Світлину профілю успішно оновлено.'
        },
        personalInfo: {
            title: 'Особисті дані',
            button: 'Зберегти зміни',
            success: 'Особисті дані успішно оновлено.',
            firstName: {
                label: 'Імʼя',
                placeholder: 'Введи своє імʼя',
            },
            lastName: {
                label: 'Прізвище',
                placeholder: 'Введи своє прізвище',
            },
        },
        language: 'Вибери свою мову',
        logout: 'Вийти з системи',
    },
    validation: {
        required: 'Будь файним вуйком, заповни тут',
        phone: {
            invalid: 'Неправильний номер телефону.',
        },
    },
    errors: {
        unexpected: 'Сталася біда. Спробуйте знову.',
        message: {
            send: 'Не вдалося відправити повіданє. Спробуйте ще раз.',
            edit: 'Не вдалося змінити повіданє. Спробуйте ще раз.',
        },
    },
    toast: {
        summary: {
            success: 'Успіх',
            error: 'Помилка',
        },
    },
    loading: "Завантажую...",
    notAvailable: "Недоступно",
    save: "Най буде",
    cancel: "Охрана отмєна",
    countries: {
        ua: 'Україна',
        us: 'Америка',
        pl: 'Польща',
        searchPlaceholder: 'Шукати',
    },
};