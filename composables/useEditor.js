import { ref } from 'vue';
export async function useEditor(editor, files) {
    const target_editor = editor.getQuill();

    const delta_content = ref([]);

    const changed_files = files.value.filter(({status_changed}) => status_changed);

    let changed_files_ = {
        'ep_links': [],
        'completed': [],
        'etas': [],
        'status':[],
    } 
    for (let index = 0; index < files.value.length; index++) {
        const file = files.value[index];
        console.log(file);
        
        console.log(`file ${file.filename} was ${file.changed_as}`);
    }

    delta_content.value = changed_files.map(({filename, data}) => {
        return { insert: `File ${filename} is in ${data.status}. \n\n` }
    });
    // ep link
    
    target_editor.setContents(delta_content.value);

    return {target_editor}
}