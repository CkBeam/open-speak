import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import block from './block.json';
import { useBlockProps } from '@wordpress/block-editor';
import './main.css';
import icons from '../../icons';

registerBlockType(block.name, {
    icon: icons.primary,
    edit() {
        const blockProps = useBlockProps();
        return (
            <>
                <div {...blockProps}>
                    <p
                        style={{
                            color: '#000000',
                            backgroundColor: '#f06e37',
                            padding: '10px',
                        }}
                    >
                        This is the Open-Speak component. Nothing is displayed
                        in the editor.
                    </p>
                </div>
            </>
        );
    },
});
