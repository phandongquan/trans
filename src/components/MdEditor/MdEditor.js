import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PaperClipOutlined } from '@ant-design/icons';
import { generateMention, replacePattern, findMentions, createMentionEntities } from './helper';

import { EditorState, convertToRaw, convertFromRaw, RichUtils, getDefaultKeyBinding } from "draft-js";
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js';
import Editor from '@draft-js-plugins/editor';
import createEmojiPlugin from '@draft-js-plugins/emoji';
import createLinkPlugin from '@draft-js-plugins/anchor';
import createImagePlugin from '@draft-js-plugins/image';
import createToolbarPlugin from '@draft-js-plugins/static-toolbar';
import { ItalicButton, BoldButton, UnderlineButton, UnorderedListButton, OrderedListButton } from '@draft-js-plugins/buttons';
import HeadlinesButton from './Buttons/HeadlinesButton';

import './config/editorStyles.css';
import './config/entryStyles.css';
import './config/entryHashtagStyles.css';
import './config/editorStyleTask.css';

const emojiPlugin = createEmojiPlugin({
    toneSelectOpenDelay: 10, 
    useNativeArt: true,
});
const linkPlugin = createLinkPlugin({ placeholder: 'http://...' });
const staticToolbarPlugin = createToolbarPlugin();
const imagePlugin = createImagePlugin();
const plugins = [emojiPlugin, linkPlugin, staticToolbarPlugin, imagePlugin];

class MdEditorTask extends Component {
    /**
     * @propsType define
     */
    static propTypes = {
        value: PropTypes.string,
        placeholder: PropTypes.string,
        resetForm: PropTypes.bool
    };

    static defaultProps = {
        value: '',
        placeholder: '',
        resetForm: false
    };

    constructor(props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty(),
            open: false,
            suggestions: [],
            openHashtag: false,
            suggestionsHashtag: []
        }

        this.onHandleKeyBindings = this.onHandleKeyBindings.bind(this);
    }

    componentDidMount() {
        let { onRef, value } = this.props;
        if (onRef) {
            onRef(this);
        }
    }

    componentDidUpdate(prevProps) {
        let { value, resetForm } = this.props;
        if (value !== prevProps.value) {

            let matchReplace = {};
            let mentionsData = [];
            let mentions = findMentions(value);
            if (mentions.length) {
                mentions.forEach((men, index) => {
                    matchReplace[men.match] = `@${men.name}`;
                    mentionsData.push(men);
                });
            }
            let regexFromMyArray = Object.keys(matchReplace).map(k => '(' + k.replace(/[-[/\]{}()*+?.,\\^$|#\s]/g, '\\$&') + ')');
            let pattern = new RegExp(regexFromMyArray.join("|"), 'gi');
            let newsContent = replacePattern(value, pattern, matchReplace);
            let rawData = markdownToDraft(newsContent);
            if (mentionsData.length) {
                rawData = createMentionEntities(rawData, mentionsData);
            }
            let contentState = convertFromRaw(rawData);
            const newMdEditor = EditorState.createWithContent(contentState);
            this.setState({ editorState: newMdEditor });
        }
        
        if(resetForm != prevProps.resetForm && resetForm) {
            this.setState({ editorState: EditorState.createEmpty() });
        }
    }

    componentWillUnmount() {
        let { onRef } = this.props;
        if (onRef) {
            onRef(undefined);
        }
    }
    
    /**
     * Handle tab event 
     * @param {*} e 
     * @returns 
     */
    onHandleKeyBindings(e) {
        let { editorState } = this.state;
        if (e.keyCode === 9) { // Tab button press
          this.setState({editorState : RichUtils.onTab(e, editorState, 4)});
          return;
        }      
        return getDefaultKeyBinding(e);
      };
    
    /**
     * OnChange
     * @param {*} editorState 
     */
    onChange = editorState => {
        this.setState({ editorState });
    };

    /**
     * Get Content
     * @returns 
     */
    getContent = () => {
        let { editorState } = this.state;
        let raw = convertToRaw(editorState.getCurrentContent());
        let { blocks, entityMap } = raw;
        let matchReplace = {};
        Object.values(entityMap).map(entity => {
            if (entity.type == 'mention') {
                matchReplace[`@${entity.data.mention.name}`] = generateMention(entity.data.mention);
            }
        });

        let value = draftToMarkdown(raw);
        let regexFromMyArray = Object.keys(matchReplace).map(k => '(' + k.replace(/[-[/\]{}()*+?.,\\^$|#\s]/g, '\\$&') + ')');
        let pattern = new RegExp(regexFromMyArray.join("|"), 'gi');
        value = replacePattern(value, pattern, matchReplace);
        return value;
    }

    // Focus
    focus = () => {
        this.editor.focus();
    };

    render() {
        let { placeholder } = this.props;
        let { editorState } = this.state;

        const { Toolbar } = staticToolbarPlugin;
        const { EmojiSuggestions, EmojiSelect } = emojiPlugin;

        return (
            <div id='box_editor_bar' className='md-editor md-editor-task' onClick={this.focus}>
                <div className='block_toolbar'>
                    { <Toolbar>
                        {
                            (externalProps) => (
                                <div className='main_block_toolbar'>
                                    <div className='block_toolbar_item'>
                                        <BoldButton {...externalProps} />
                                        <ItalicButton {...externalProps} />
                                        <UnderlineButton {...externalProps} />
                                        <HeadlinesButton {...externalProps} />
                                        <UnorderedListButton {...externalProps} />
                                        <OrderedListButton {...externalProps} />
                                    </div>
                                    <div className='block_toolbar_item'>
                                        {/* <linkPlugin.LinkButton {...externalProps} />
                                        <div className='headlineButtonWrapper emoji'>
                                            <EmojiSuggestions className='emif' />
                                            <EmojiSelect closeOnEmojiSelect />
                                        </div> */}
                                        {/* <div className='headlineButtonWrapper'>
                                            <button className='headlineButton' onClick={() => this.props.onChangeUpload()}>
                                                <PaperClipOutlined style={{ fontSize: 16 }} />
                                            </button>
                                        </div> */}
                                    </div>
                                </div>
                            )
                        }
                    </Toolbar> }
                </div>
                <Editor editorKey={'editor'}
                    editorState={editorState}
                    placeholder={placeholder}
                    onChange={this.onChange}
                    onTab={this.onHandleKeyBindings}
                    plugins={plugins}
                    ref={(element) => {
                        this.editor = element;
                    }}
                />
            </div>
        )
    }
}

export default MdEditorTask