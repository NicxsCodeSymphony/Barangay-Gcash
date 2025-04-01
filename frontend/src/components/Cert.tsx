import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import axios from 'axios';
import { 
  Download, 
  Mail, 
  CheckCircle, 
  AlertCircle
} from "lucide-react";

import { getData } from "../utils/getData";

const CertificationGenerator = ({ documentDetails }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {data: resident} = getData('residents/' + documentDetails?.residentId)

  console.log(documentDetails)

  // Function to generate PDF
  const generatePDF = async () => {
    setIsGenerating(true);
    setSuccessMessage("");
    setErrorMessage("");
    
    try {
      // Create new PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // Set font
      doc.setFont("helvetica", "normal");
      
      // Add content
      doc.setFontSize(10);
      doc.text("Republic of the Philippines", 105, 20, { align: "center" });
      doc.text("Province of Cebu", 105, 25, { align: "center" });
      doc.text("City/Municipality of Medellin", 105, 30, { align: "center" });
      doc.text("Barangay Lamintak Sur", 105, 35, { align: "center" });
      doc.text("Office of the Punong Barangay", 105, 40, { align: "center" });
      
      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("BARANGAY CERTIFICATION", 105, 60, { align: "center" });
      
      // Reset font
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      
      // Main content
      doc.text("To Whom It May Concern:", 20, 80);
      
      // Paragraph with details
      const residentInfo = `This is to certify that ${documentDetails.requester_name}, ${resident.age || "[Age]"}, ${resident.civil_status || "[Civil Status]"}, and a resident of ${resident.barangay || "[Complete Address]"}, Barangay Lamintak Sur, Medellin, Cebu, has been a bonafide resident of this barangay since ${resident.yearsResidency || "[Year of Residency]"}.`;
      
      const splitResidentInfo = doc.splitTextToSize(residentInfo, 170);
      doc.text(splitResidentInfo, 20, 100);
      
      // Purpose
      const purposeText = `This certification is issued upon the request of the above-named individual for ${documentDetails.document_type || "[Purpose of the Certificate]"}.`;
      const splitPurpose = doc.splitTextToSize(purposeText, 170);
      doc.text(splitPurpose, 20, 120);
      
      // Date issued
      const currentDate = new Date();
      const day = currentDate.getDate();
      const month = currentDate.toLocaleString('default', { month: 'long' });
      const year = currentDate.getFullYear();
      
      doc.text(`Issued this ${day} of ${month}, ${year} at Barangay Lamintak Sur, Medellin, Cebu, Philippines.`, 20, 140);
      
      // Signature
      doc.text("Certified by:", 20, 170);
      doc.setFont("helvetica", "bold");
      doc.text("Hon. Ambrosio Tahadlangit", 20, 200);
      doc.setFont("helvetica", "normal");
      doc.text("Barangay Captain", 20, 205);
      
      // Add optional watermark or seal
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(60);
      doc.text("BARANGAY SEAL", 105, 140, { align: "center", angle: 45 });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Save PDF
      const pdfOutput = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfOutput);
      
      // Open PDF in new tab
      window.open(pdfUrl, '_blank');
      
      setSuccessMessage("PDF generated successfully!");
      return pdfOutput;
    } catch (error) {
      console.error("Error generating PDF:", error);
      setErrorMessage("Failed to generate PDF. Please try again.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to send email with PDF
  const sendEmailWithPDF = async () => {
    setIsSending(true);
    setSuccessMessage("");
    setErrorMessage("");
    
    try {
      // Generate PDF first
      const pdfBlob = await generatePDF();
      
      if (!pdfBlob) {
        throw new Error("Failed to generate PDF");
      }
      
      // Create form data to send
      const formData = new FormData();
      formData.append('to', documentDetails.requester_email);
      formData.append('subject', 'Barangay Certification');
      formData.append('message', `Dear ${documentDetails.requester_name},\n\nPlease find attached your requested Barangay Certification.\n\nRegards,\nBarangay Lamintak Sur Office`);
      formData.append('attachment', pdfBlob, 'barangay_certification.pdf');
      
      // Send email using your backend API
      const response = await axios.post('https://barangayapi.vercel.app/send-email', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setSuccessMessage("Email sent successfully!");
        
        // Update document status in your database
        await axios.put(`https://barangayapi.vercel.app/document/${documentDetails.documentId}`, {
          status: "Completed",
          email_sent: true,
          email_sent_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        });
        
      } else {
        throw new Error(response.data.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setErrorMessage("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm space-y-4">
      <h3 className="text-lg font-medium">Barangay Certification Generator</h3>
      
      {successMessage && (
        <div className="p-3 rounded bg-green-50 text-green-700 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="p-3 rounded bg-red-50 text-red-700 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {errorMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
        >
          <Download className="mr-2 h-5 w-5" />
          {isGenerating ? "Generating..." : "Generate PDF"}
        </button>
        
        <button
          onClick={sendEmailWithPDF}
          disabled={isSending}
          className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
        >
          <Mail className="mr-2 h-5 w-5" />
          {isSending ? "Sending..." : "Generate & Send Email"}
        </button>
      </div>
    </div>
  );
};

export default CertificationGenerator;