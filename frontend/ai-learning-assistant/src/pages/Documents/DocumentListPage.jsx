import React, {useState, useEffect} from 'react'
import {Plus, Upload, Trash2, X} from "lucide-react"
import toast from 'react-hot-toast'

import documentService from "../../services/documentService"
import Spinner from '../../components/common/spinner'
import DocumentCard from '../../components/documents/DocumentCard'
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
      setDocuments(data?.data || []);
    }
    catch(error) {  
      toast.error(error?.message || "Failed to fetch documents");
      console.error('Fetch documents error:', error);
    } 
    finally{
      setLoading(false);
    }
  }

  useEffect(()=>{
    fetchDocument();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if(file){
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
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

  const handleDeleteRequest = (doc) => {
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
    if (loading) {
      return <Spinner />;
    }

    if (!documents || documents.length === 0) {
      return (
        <div className='rounded-3xl border border-dashed border-slate-200 bg-white/80 p-16 text-center text-slate-500'>
          No documents yet. Upload your first file to get started.
        </div>
      );
    }

    return (
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {documents.map((doc) => (
          <DocumentCard key={doc._id} document={doc} onDelete={handleDeleteRequest} />
        ))}
      </div>
    );
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
          <Button onClick={()=>setIsUploadModalOpen(true)}>
          <Plus className='w-4 h-4' strokeWidth={2.5} />
          Upload Document
        </Button>
      </div>
      {renderContent()}

      {isUploadModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h2 className='text-xl font-semibold'>Upload Document</h2>
                <p className='text-sm text-slate-500'>Choose a file and add a title.</p>
              </div>
              <button className='text-slate-400 hover:text-slate-700' onClick={() => setIsUploadModalOpen(false)}>
                <X className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleUpload} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-slate-700'>Title</label>
                <input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className='mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none'
                  placeholder='Document title'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-slate-700'>File</label>
                <input
                  type='file'
                  onChange={handleFileChange}
                  className='mt-2 w-full text-sm text-slate-700'
                />
              </div>
              <div className='flex gap-3 justify-end'>
                <Button type='button' variant='outline' onClick={() => setIsUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button type='submit' disabled={uploading}>
                  <Upload className='w-4 h-4' />
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedDocs && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h2 className='text-xl font-semibold'>Delete document</h2>
                <p className='text-sm text-slate-500'>Confirm deletion for “{selectedDocs.title}”.</p>
              </div>
              <button className='text-slate-400 hover:text-slate-700' onClick={() => setIsDeleteModalOpen(false)}>
                <X className='w-5 h-5' />
              </button>
            </div>
            <div className='space-y-6'>
              <p className='text-sm text-slate-600'>This action cannot be undone.</p>
              <div className='flex justify-end gap-3'>
                <Button type='button' variant='outline' onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button type='button' onClick={handleConfirmDelete} disabled={deleting}>
                  <Trash2 className='w-4 h-4' />
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
      
    </div>
  )
}

export default DocumentListPage  