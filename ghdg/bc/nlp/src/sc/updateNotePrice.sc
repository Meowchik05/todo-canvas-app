theme: /

    state: ИзменениеЦены
        q!: (измени цену|обнови стоимость|поправь цену)
            [на] $Number::newPrice [руб|₽]
            
        script:
            var id = get_id_by_selected_item(get_request($context));
            updateNotePrice(id, $context, $parseTree._newPrice);
        random:
            a: Цена обновлена на {newPrice}₽
            a: Стоимость изменена на {newPrice}₽
            a: Готово, новая цена {newPrice}₽