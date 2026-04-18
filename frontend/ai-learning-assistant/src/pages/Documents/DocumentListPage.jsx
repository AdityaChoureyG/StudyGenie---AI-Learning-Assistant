import React, {useState, useEffect} from 'react'
import {Plus, Upload, Trash2, FileText, X} from "lucide-react"
import toast from 'react-hot-toast'

import documentService from "../../services/documentService"
import spinner from '../../components/common/spinner'
import Button from '../../components/common/Button'


const DocumentListPage = () => {

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // state for upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  // state for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState(null);

  const fetchDocument = async () => {
    try{
      const data = await documentService.getDocuments();
      console.log(data);
      setDocuments(data);
    }
    catch(error) {
      toast.error("Failed to fetch documents");
      console.error(error);
    }
    finally{
      setLoading(false);
    }
  }

  useEffect(()=>{
    fetchDocument();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.file[0];
    if(file){
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+&/, ""));
    }
  }

  const handleUpload =  async (e) => {
    e.preventDefault();
    if(!uploadFile && !uploadTitle){
      toast.error("Please provide a title and select a file.");
      return ;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    try{
      await documentService.uploadDocument(formData);
      toast.success("Document uploaded successfully");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setLoading(true);
      fetchDocument();
    }
    catch(error){
      toast.error(error.message || "Upload failed");
    }
    finally{
      setUploading(false);
    }
  }

  const handleDeleteRequest = () => {
    setSelectedDocs(doc);
    setIsDeleteModalOpen(true);
  }

  const handleConfirmDelete = async () => {
    if(!selectedDocs) return;
    setDeleting(true);
    try{
      await documentService.deleteDocument(selectedDocs._id);
      toast.success(`'${selectedDocs.title}' deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedDocs(null);
      setDocuments(documents.filter((d) => d._id !== selectedDocs._id));
    }
    catch(error){
      toast.error(error.message || "Failed to delete document");
    }
    finally{
      setDeleting(false);
    }
  }

  const renderContent = () => {
    return <div>renderContent</div>
  }

  return (
    <div className="min-h-screen">
      {/* subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px, transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none " />
      <div className="relative max-w-7xl mx-auto">
        {/* header */}
        <div className="flex items-center justify-between mb-10">
          <div className="">
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
              My Documents
            </h1>
            <p className="text-slate-500 text-sm">
              Manage and Organise your learning materials
            </p>
          </div>
          {documents.length > 0 && (
            <Button onClick={()=>setIsUploadModalOpen(true)}>
              <Plus className='w-4 h-4' strokeWidth={2.5} />
              Uplaod Document
            </Button>
          )}
        </div>
        {renderContent()}

      </div>
      
    </div>
  )
}

export default DocumentListPage  