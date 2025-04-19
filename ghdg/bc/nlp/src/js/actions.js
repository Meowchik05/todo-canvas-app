function addNote(note, context, price) {
    addAction({
        type: "add_note",
        note: note,
        ...(price && { price: Math.round(price * 100) / 100 }) 
    }, context);
}

function deleteNote(id, context){
    addAction({
        type: "delete_note",
        id: id
    }, context);
}

function updateNotePrice(id, context, newPrice) {
    addAction({
        type: "update_note",
        id: id,
        update: {
            price: newPrice
        }
    }, context);
}

function updateNoteText(id, context, newText) {
    addAction({
        type: "update_note",
        id: id,
        update: {
            note: newText
        }
    }, context);
}

function movePriceToNote(sourceId, targetId, context) {
    addAction({
        type: "move_price",
        source_id: sourceId,
        target_id: targetId
    }, context);
}
