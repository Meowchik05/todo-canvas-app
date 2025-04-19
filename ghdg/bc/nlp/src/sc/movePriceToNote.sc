theme: /

    state: ПереносЦены
        q!: (перенеси цену|перемести стоимость)
            [из] [этой] [заметки]
            [в] [другую] [заметку]
            
        script:
            var sourceId = get_id_by_selected_item(get_request($context));
            var targetId = /* логика получения targetId из контекста */;
            movePriceToNote(sourceId, targetId, $context);
        random:
            a: Цена перенесена
            a: Стоимость перемещена
            a: Готово, сумма переведена