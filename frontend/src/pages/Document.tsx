import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Trash2, Edit, Mail, CheckCircle, XCircle, Clock, Search, Download, Eye, Filter } from "lucide-react";
import { getData } from "../utils/getData";
import axios from 'axios'
import CertificationGenerator from "../components/Cert";

const Document = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState({ message: '', type: ''});

  const [allDocuments, setAllDocuments] = useState();

  const fetch = async () => {
    try{
        setLoading(true);
        const res = await axios.get('http://localhost:3001/document')
        setAllDocuments(res.data)
        setLoading(false);
    }
    catch(err){
        console.error(err)
        setLoading(false);
        setActionStatus({ message: 'Error fetching documents', type: 'error' });
    }
  }

  useEffect(() => {
    fetch()
  }, [])

  // Function to handle document status change
  const handleStatusChange = async (documentId, newStatus) => {
    try {
      setLoading(true);
      const updateData = { 
        status: newStatus 
      };
      
      // Add approval date if status is Approved
      if (newStatus === "Approved") {
        updateData.approval_date = new Date().toLocaleDateString('en-US', { 
          month: 'long', day: 'numeric', year: 'numeric' 
        });
      }
      
      // Send update request to backend
      const response = await axios.put(`http://localhost:3001/document/${documentId}`, updateData);
      
      if (response.data.success) {
        // Update UI
        setAllDocuments(prevDocs => 
          prevDocs.map(doc => 
            doc.documentId === documentId ? { ...doc, ...updateData } : doc
          )
        );
        
        setActionStatus({ 
          message: `Document ${newStatus.toLowerCase()} successfully`, 
          type: 'success' 
        });
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setActionStatus({ 
        message: `Error updating document status: ${err.message}`, 
        type: 'error' 
      });
    }
  };

  // Function to handle sending email
  const handleSendEmail = async (documentId) => {
    try {
      setLoading(true);
      const updateData = {
        email_sent: true,
        email_sent_date: new Date().toLocaleDateString('en-US', { 
          month: 'long', day: 'numeric', year: 'numeric' 
        })
      };

      console.log(updatedData)
      
      // Send update request to backend
      const response = await axios.put(`http://localhost:3001/document/${documentId}`, updateData);
      
      if (response.data.success) {
        // Update UI
        setAllDocuments(prevDocs => 
          prevDocs.map(doc => 
            doc.documentId === documentId ? { ...doc, ...updateData } : doc
          )
        );
        
        setActionStatus({ 
          message: 'Email notification sent successfully', 
          type: 'success' 
        });
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setActionStatus({ 
        message: `Error sending email: ${err.message}`, 
        type: 'error' 
      });
    }
  };

  // Function to handle document deletion
  const handleDeleteDocument = async (documentId) => {
    try {
      setLoading(true);
      // Send delete request to backend
      const response = await axios.delete(`http://localhost:3001/document/${documentId}`);
      
      if (response.data.success) {
        // Update UI
        setAllDocuments(prevDocs => prevDocs?.filter(doc => doc.documentId !== documentId));
        setActionStatus({ 
          message: 'Document deleted successfully', 
          type: 'success' 
        });
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setActionStatus({ 
        message: `Error deleting document: ${err.message}`, 
        type: 'error' 
      });
    }
  };

  // Function to handle document view
  const handleViewDocument = (document) => {
    console.log(document)
    setSelectedDocument(document);
    setIsViewModalOpen(true);
  };

  // Function to filter documents based on search term and status
  const filteredDocuments = allDocuments?.filter(doc => {
    const matchesSearch = doc.requester_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Function to get status color
  const getStatusColor = (status) => {
    switch(status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case "Approved":
        return <CheckCircle className="w-4 h-4" />;
      case "Rejected":
        return <XCircle className="w-4 h-4" />;
      case "Pending":
        return <Clock className="w-4 h-4" />;
      case "Processing":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-row">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Document Requests</h1>
            <p className="text-gray-600 mt-2">
              Manage and process document requests from residents.
            </p>
          </div>

          {/* Status message */}
          {actionStatus.message && (
            <div className={`mb-4 p-4 rounded-md ${actionStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {actionStatus.type === 'success' ? 
                    <CheckCircle className="h-5 w-5 text-green-400" /> : 
                    <XCircle className="h-5 w-5 text-red-400" />
                  }
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{actionStatus.message}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setActionStatus({ message: '', type: '' })}
                      className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        actionStatus.type === 'success' ? 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600' : 
                        'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600'
                      }`}
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search by name or document type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </button>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          )}

          {/* Document List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requester
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Sent
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!loading && filteredDocuments?.length > 0 ? (
                    filteredDocuments?.map((doc) => (
                      <tr key={doc.documentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {doc.requester_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {doc.requester_email}
                              </div>
                              <div className="text-sm text-gray-500">
                                {doc.requester_contact}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{doc.document_type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{doc.requested_date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                            {getStatusIcon(doc.status)}
                            <span className="ml-1">{doc.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.email_sent ? (
                            <div>
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Sent
                              </span>
                              <div className="text-xs text-gray-500 mt-1">{doc.email_sent_date}</div>
                            </div>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              <XCircle className="w-4 h-4 mr-1" />
                              Not Sent
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleViewDocument(doc)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View Document"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  
                  {doc.status === "Approved" && !doc.email_sent && (
                    <button
                      onClick={() => handleSendEmail(doc.documentId)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Send Email Notification"
                    >
                      <Mail className="w-5 h-5" />
                    </button>
                  )}
                  
                  {doc.status === "Pending" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(doc.documentId, "Approved")}
                        className="text-green-600 hover:text-green-900"
                        title="Approve Document"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(doc.documentId, "Rejected")}
                        className="text-red-600 hover:text-red-900"
                        title="Reject Document"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => handleDeleteDocument(doc.documentId)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete Document"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
</td>


</tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      <div className="text-gray-500">
                        {loading ? "Loading documents..." : "No documents found matching your criteria."}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Document Modal */}
        {isViewModalOpen && selectedDocument && (
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Document Details
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-500">Requester Information</h4>
                          <p className="text-base text-gray-800">{selectedDocument.requester_name}</p>
                          <p className="text-sm text-gray-600">{selectedDocument.requester_email}</p>
                          <p className="text-sm text-gray-600">{selectedDocument.requester_contact}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-500">Document Type</h4>
                          <p className="text-base text-gray-800">{selectedDocument.document_type}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-500">Request Date</h4>
                          <p className="text-base text-gray-800">{selectedDocument.requested_date}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-500">Status</h4>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedDocument.status)}`}>
                            {getStatusIcon(selectedDocument.status)}
                            <span className="ml-1">{selectedDocument.status}</span>
                          </span>
                        </div>
                        {selectedDocument.status === "Approved" && selectedDocument.approval_date && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500">Approval Date</h4>
                            <p className="text-base text-gray-800">{selectedDocument.approval_date}</p>
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-500">Email Notification</h4>
                          {selectedDocument.email_sent ? (
                            <div>
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Sent on {selectedDocument.email_sent_date}
                              </span>
                            </div>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              <XCircle className="w-4 h-4 mr-1" />
                              Not Sent
                            </span>
                          )}
                        </div>
                        
                        {selectedDocument.status === "Approved" && (
                          <div className="mt-6">
                            <h4 className="text-sm font-semibold text-gray-500">Certificate Preview</h4>
                            <div className="mt-2 border border-gray-200 p-4 rounded-md">
                              <CertificationGenerator documentDetails={selectedDocument} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  {selectedDocument.status === "Approved" && (
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Certificate
                    </button>
                  )}
                  {selectedDocument.status === "Approved" && !selectedDocument.email_sent && (
                    <button
                      type="button"
                      onClick={() => {
                        handleSendEmail(selectedDocument.documentId);
                        setIsViewModalOpen(false);
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsViewModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default Document;
