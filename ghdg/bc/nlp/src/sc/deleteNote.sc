theme: /

    state: Удаление
        q!: (удалить|стереть|убери)
            [эту|выбранную|текущую]
            [заметку|напоминание|запись]
            
        script:
            var id = get_id_by_selected_item(get_request($context));
            deleteNote(id, $context);
        random:
            a: Заметка удалена
            a: Готово, убрал эту запись
            a: Сделано, больше нет этой заметки