theme: /

    state: Добавление
        q!: (добавить|создать|записать) 
            [заметку|напоминание|покупку]
            $AnyText::noteText
            [за] $Number::price [рублей|р|₽]
            
        script:
            addNote($parseTree._noteText, $context, $parseTree._price);
        random:
            a: Заметка "{noteText}" за {price}₽ добавлена
            a: Добавил "{noteText}" с ценой {price}₽
            a: Готово! "{noteText}" за {price}₽ записано