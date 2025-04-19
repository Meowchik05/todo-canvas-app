theme: /

    state: ИзменениеТекста
        q!: (измени текст|переименуй|исправь запись)
            [на] $AnyText::newText
            
        script:
            var id = get_id_by_selected_item(get_request($context));
            updateNoteText(id, $context, $parseTree._newText);
        random:
            a: Текст изменен на "{newText}"
            a: Запись переименована в "{newText}"
            a: Готово, теперь это "{newText}"