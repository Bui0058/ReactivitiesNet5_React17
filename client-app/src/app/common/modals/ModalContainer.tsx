import React from 'react';
import { useStore } from "../../stores/stores";
import { observer } from "mobx-react-lite";
import { Modal } from 'semantic-ui-react';


function ModalContainer() {
    const {modalStore} = useStore();
    return (
        <Modal open={modalStore.modal.open} onClose={modalStore.closeModal} size='mini'>
            {modalStore.modal.body}
        </Modal>
    )
}

export default observer(ModalContainer);