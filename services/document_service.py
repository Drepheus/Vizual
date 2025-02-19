import os
import logging
from PyPDF2 import PdfReader
from docx import Document
import magic

logger = logging.getLogger(__name__)

# Use absolute path for upload folder
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'uploads'))
ALLOWED_EXTENSIONS = {'pdf', 'txt', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ensure_upload_directory():
    try:
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER, mode=0o755)
            logger.info(f"Created upload directory: {UPLOAD_FOLDER}")
        # Ensure directory has correct permissions
        os.chmod(UPLOAD_FOLDER, 0o755)
        logger.info(f"Upload directory ready at: {UPLOAD_FOLDER}")
        return True
    except Exception as e:
        logger.error(f"Failed to create or verify upload directory: {str(e)}")
        return False

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    try:
        with open(file_path, 'rb') as file:
            pdf = PdfReader(file)
            text = ""
            for page in pdf.pages:
                text += page.extract_text() + "\n"
            return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        return None

def extract_text_from_docx(file_path):
    """Extract text from DOCX file"""
    try:
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {str(e)}")
        return None

def extract_text_from_txt(file_path):
    """Extract text from TXT file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read().strip()
    except UnicodeDecodeError:
        # Try with a different encoding if UTF-8 fails
        try:
            with open(file_path, 'r', encoding='latin-1') as file:
                return file.read().strip()
        except Exception as e:
            logger.error(f"Error reading text file with latin-1 encoding: {str(e)}")
            return None
    except Exception as e:
        logger.error(f"Error extracting text from TXT: {str(e)}")
        return None

def process_document(file_path):
    """Process document and extract text based on file type"""
    try:
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return None

        mime = magic.Magic(mime=True)
        file_type = mime.from_file(file_path)
        logger.debug(f"Detected MIME type: {file_type}")

        if 'pdf' in file_type:
            return extract_text_from_pdf(file_path)
        elif 'msword' in file_type or 'officedocument' in file_type:
            return extract_text_from_docx(file_path)
        elif 'text/plain' in file_type:
            return extract_text_from_txt(file_path)
        else:
            logger.error(f"Unsupported file type: {file_type}")
            return None
    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        return None
    finally:
        # Clean up the uploaded file after processing
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.debug(f"Cleaned up temporary file: {file_path}")
        except Exception as e:
            logger.warning(f"Failed to clean up temporary file {file_path}: {str(e)}")