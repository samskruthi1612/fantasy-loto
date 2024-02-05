import React, { useState, useRef, useEffect } from 'react';
import 'react-quill/dist/quill.snow.css';
import editIcon from '../../assets/edit-icon.svg';
import './InfoPage.css';
import Editors from '../MuiTiptap/Editor';
import { Alert } from "../../elements/alert/Alert";
import { ErrorAlert } from "../../elements/alert/ErrorAlert";
import { CenterFantasyLoader } from '../../elements/fantasyLotoLoader/FantasyLotoLoader';
import { fetchData } from '../../api/fetchData';
import { fetchFunc } from '../../api/fetchFunc';
import parse, { domToReact } from 'html-react-parser';
import { superAdminRole } from '../../util/constants';
import DOMPurify from 'dompurify';

const sanitizeContent = (content) => {
  const htmlString = content?.information ?? ''
  const updatedWidthHtml = htmlString.replace(/colwidth=/g,"width=")
  const sanitized= DOMPurify.sanitize(updatedWidthHtml)
  console.log('sanitized ',sanitized)
  return sanitized
}

const options = {
  replace(domNode) {
    const props = domNode.attribs ?? {}
    switch (domNode.name) {
      case 'table':
        return <table className='borderTableCell' {...props}>{domToReact(domNode.children,options)}</table>;
      case 'tr':
        return <tr className='borderTableCell' {...props}>{domToReact(domNode.children,options)}</tr>;
      case 'th':
        return <th className='borderTableCell highlightHeader' {...props}>{domToReact(domNode.children,options)}</th>;
      case 'td':
        return <td className='borderTableCell' {...props}>{domToReact(domNode.children,options)}</td>;
      default:
        return domNode
    }
  },
};

const InfoPage = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [editing, setEditing] = useState(false);

  const editorRef = useRef(null);

  const fetchInfo = () => {
    fetchData(process.env.REACT_APP_INFO_API, setLoading, setContent, setErrorMsg)
  }

  const showUpdateAlert = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 5000)
  }

  const showErrorAlert = (msg) => {
    setErrorMsg(msg)
    setTimeout(() => setErrorMsg(''), 5000)
  }

  const postNewInfoPageContent = (newContent) => {
    fetchFunc(process.env.REACT_APP_INFO_API, 'PUT', {}, 
    {...content, information: newContent},
    setLoading, 
    ()=>showUpdateAlert('Successfully updated the content'), 
    ()=>showErrorAlert('Failed to save new content. Please save again'))
  }

  const handleEditClick = () => {
    setOriginalContent(content);
    setEditing(true);
  };

  const handleCancelClick = () => {
    setContent(originalContent);
    setEditing(false);
  };

  const handleSaveClick = () => {
    // Save or update the edited content as needed
    const newContent = editorRef?.current?.editor?.getHTML()
    console.log(newContent)
    setContent(curCont => ({...curCont, information: newContent}))
    postNewInfoPageContent(newContent);
    setEditing(false);
  };

  useEffect(fetchInfo, [])

  const isSuperAdmin = localStorage.getItem('userRole') === superAdminRole

  return (
    <div>
      {loading && <CenterFantasyLoader />}
      <div className="InfoPage">
        <h2>Fantasy Loto Info</h2>
        {(!editing && isSuperAdmin) && (
          <button className="edit Btn" onClick={handleEditClick}>
            Edit this page
            <img src={editIcon} alt="edit icon" className="editIcon" />
          </button>
        )}
        {editing && (
          <div className="afterEdit">
            <button className="Btn" onClick={handleCancelClick}>
              Cancel
            </button>
            <button className="save Btn" onClick={handleSaveClick}>
              Save
            </button>
          </div>
        )}
      </div>
      {editing ?
        <div className="EditorContainer">
          <div className="Editor">
            <Editors rteRef={editorRef} currentContent={content?.information} />
          </div>
        </div>
        :
        <div>{parse(sanitizeContent(content), options)}</div>
      }
      {successMsg && 
        <Alert 
            message={successMsg}
            style={{position:'absolute', left:'36px', bottom:'65px', 'z-index':'2'}} 
            onClick={()=>setSuccessMsg(false)}
        />
      }
      {errorMsg && 
        <ErrorAlert 
            message={errorMsg}
            style={{position:'absolute', left:'36px', bottom:'65px', 'z-index':'2'}} 
            onClick={()=>setErrorMsg(false)}
        />
      }
    </div>
  );
};

export default InfoPage;
