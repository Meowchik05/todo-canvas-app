require: slotfilling/slotFilling.sc
  module = sys.zb-common
  
# Подключение javascript обработчиков
require: js/getters.js
require: js/reply.js
require: js/actions.js

# Подключение все сценарные файлов
require: sc/addNote.sc
require: sc/deleteNote.sc
require: sc/updateNotePrice.sc
require: sc/updateNoteText.sc
require: sc/movePriceToNote.sc

patterns:
    $AnyText = $nonEmptyGarbage
    $Number = $regexp<\d+>

theme: /
    state: Start
        q!: $regex</start>
        q!: (запусти | открой) my canvas test
        a: Готов к работе. Можете:
           - Добавлять заметки
           - Удалять заметки
           - Изменять цены и текст

    state: Fallback
        event!: noMatch
        a: Не понял команду. Попробуйте:
           - "Добавить заметку"
           - "Удалить эту запись"
           - "Изменить цену"

    state: ОбработкаЧисел
        q: * $Number *
        script:
            $session.lastNumber = $parseTree._Number