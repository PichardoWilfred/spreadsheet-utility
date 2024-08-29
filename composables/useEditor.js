import { ref } from 'vue';
export async function useEditor(editor, files) {
    const target_editor = editor.getQuill();

    const delta_content = ref([]);

    const changed_files = files.value.filter(({status_changed}) => status_changed);

    delta_content.value = changed_files.map(({filename, data}) => {
        return { insert: `File ${filename} is in ${data.status}. \n\n` }
    });
    // ep link
    
    target_editor.setContents(delta_content.value);

    return {target_editor}
}