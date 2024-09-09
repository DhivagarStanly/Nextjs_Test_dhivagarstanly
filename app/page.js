'use client';
import Image from "next/image";
import './globals.css';
import icon from '../assets/left-arrow.png';
import { Button, Offcanvas, Form ,Spinner} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Formik, Field, Form as FormikForm, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';


export default function Home() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false)
  const [schemas, setSchemas] = useState([]);
  const [selectedSchema, setSelectedSchema] = useState('');
  const [availableSchemas, setAvailableSchemas] = useState([
    { label: 'First Name', value: 'first_name', type: 'user' },
    { label: 'Last Name', value: 'last_name', type: 'user' },
    { label: 'Gender', value: 'gender', type: 'user' },
    { label: 'Age', value: 'age' },
    { label: 'Account Name', value: 'account_name', type: 'group' },
    { label: 'City', value: 'city', type: 'group' },
    { label: 'State', value: 'state', type: 'group' },
  ]);

  const [showtoast, setShowToast] = useState(false);
  const handleAddSchema = (setFieldValue) => {
    if (selectedSchema) {
      const selectedOption = availableSchemas.find((schema) => schema.value === selectedSchema);
      setSchemas([...schemas, selectedOption]);
      setAvailableSchemas(availableSchemas.filter((schema) => schema.value !== selectedSchema));
      setSelectedSchema('');
      setFieldValue('schemas', [...schemas, selectedOption]);
    }
  };

  const validationSchema = Yup.object().shape({
    segment_name: Yup.string().required('Segment name is required'),
    schemas: Yup.array().min(1, 'At least one schema is required'),
  });

  const handleSaveSegment = async (values) => {
    setLoading(true)
    const formattedSchemas = values.schemas.map((schema) => ({
      [schema.value]: schema.label,
    }));
  
    const payload = {
      segment_name: values.segment_name,
      schema: formattedSchemas,
    };
  
    console.log('Payload to be sent to server:', payload);
  
    try {
      setLoading(true)
      const response = await fetch('https://webhook.site/website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        const contentType = response.headers.get('Content-Type');
        // const responseData = await response.json();
        if (contentType && contentType.includes('application/json')) {
          const responseData = await response.json();
          console.log('Response from server:', responseData);
          setShow(false);
          setShowToast(true)
        } else {
          console.log('No JSON response, but the request was successful.');
          setShow(false)
          setShowToast(true)
        }
  
        
      } else {
        console.error('Failed to save the segment:', response.statusText);
        
      }
    } catch (error) {
      console.error('Error occurred while saving the segment:', error);
      
    }finally{
      setLoading(false)
    }
  };
  
  return (
    <>
      <Offcanvas show={show} onHide={() => setShow(false)} placement="end" style={{ height: '100vh', width: '30%' }}>
      
        <Offcanvas.Header style={{ backgroundColor: '#229799', color: 'white' }}>
          <Image onClick={()=>setShow(false)} width={18} height="auto" src={icon} alt="arrow-icon" style={{ display: 'flex', marginRight: '10px', alignItems: 'center', justifyContent: 'center', cursor:'pointer' }} />
          <Offcanvas.Title>Saving Segment</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{height:"100%"}}>
        <div style={{height:"100%"}}>
          <Formik
            initialValues={{ segment_name: '', schemas: schemas }}
            validationSchema={validationSchema}
            onSubmit={handleSaveSegment}
          >
            {({ values, setFieldValue }) => (
              <FormikForm style={{height:"100%"}}>
                <div style={{height:"90%"}}>
                <Form.Group className="mb-3" controlId="formSegmentName">
                  <Form.Label>Enter the Name of the Segment</Form.Label>
                  <Field name="segment_name" type="text" className="form-control" placeholder="name of the Segment" />
                  <ErrorMessage name="segment_name" component="div" className="text-danger" />
                </Form.Group>

                <p className="mt-4 mb-4">To save your segment, you need to add the schemas to build the query</p>

                <div className="d-flex gap-4 " style={{ justifyContent: 'flex-end' }}>
                  <div className="d-flex items-center justify-items-center gap-2">
                    <p className="circle m-0" style={{ backgroundColor: '#6DC14F' }}></p>
                    <p>User Traits</p>
                  </div>
                  <div className="d-flex items-center justify-items-center gap-2">
                    <p className="circle m-0" style={{ backgroundColor: '#DC3545' }}></p>
                    <p>Group Traits</p>
                  </div>
                  {/* <div></div> */}
                </div>

                <div className="blue-box mt-3 p-3" style={{ backgroundColor: '#e7f3ff', border:"1px solid #1EA0FF" }}>
                  {values.schemas.map((schema, index) => (
                    <Form.Group key={index} className="mb-2">
                      <div className="d-flex items-center justify-items-center gap-2">
                        <p className="circle" style={{ backgroundColor: schema.type === 'user' ? '#6DC14F' : '#DC3545' }}></p>
                        <Form.Select
                          value={schema.value}
                          onChange={(e) => {
                            const updatedSchema = availableSchemas.find((sch) => sch.value === e.target.value);
                            const updatedSchemas = values.schemas.map((s, i) => (i === index ? updatedSchema : s));
                            setSchemas(updatedSchemas);
                            setFieldValue('schemas', updatedSchemas);
                            setAvailableSchemas([...availableSchemas.filter((sch) => sch.value !== e.target.value), schema]);
                          }}
                        >
                          <option value={schema.value}>{schema.label}</option>
                          {availableSchemas.map((sch) => (
                            <option key={sch.value} value={sch.value}>
                              {sch.label}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                    </Form.Group>
                  ))}
                  <ErrorMessage name="schemas" component="div" className="text-danger" />
                </div>

                <Form.Group className="mb-3 mt-3" controlId="formSchema">
                  <div className="d-flex items-center justify-items-center gap-2">
                    <p className="circle" style={{ backgroundColor: '#8F8F8F' }}></p>
                    <Form.Select value={selectedSchema} onChange={(e) => setSelectedSchema(e.target.value)}>
                      <option value="">Add schema to segment</option>
                      {availableSchemas.map((schema) => (
                        <option key={schema.value} value={schema.value}>
                          {schema.label}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                </Form.Group>

                <div className="pl-0">
                  <Button variant="link" onClick={() => handleAddSchema(setFieldValue)} style={{ paddingLeft: '0 ' }}>
                    + Add new schema
                  </Button>
                </div>
                </div>

                <div className="d-flex gap-2 items-center justify-items-center " style={{  height:"8%"}}>
                  <Button variant="success" className="mt-3" type="submit">
                  {loading&& <Spinner animation="border" variant="light" size="sm" style={{marginRight:"5px"}}/> }
                    Save Segment
                  </Button>

                  <Button variant="outline-danger" className="mt-3" onClick={() => setShow(false)}>
                    Cancel
                  </Button>
                </div>
              </FormikForm>
            )}
          </Formik>
      </div>
          
        </Offcanvas.Body>
      </Offcanvas>

      <div style={{ backgroundColor: '#666666' }} className="bg items-center justify-items-center min-h-screen pb-20 pt-0 gap-16 sm:pb-20 sm:pt-0 font-[family-name:var(--font-geist-sans)]">
        <div className="nav">
          <Image width={18} height="auto" src={icon} alt="arrow-icon" style={{ display: 'flex', marginLeft: '40px', alignItems: 'center', justifyContent: 'center' }} />
          <h5 style={{ color: 'white', fontWeight: 'bold', margin: 0 }}>View Audience</h5>
        </div>
        <div className="p-5">
          <Button variant="outline-light" onClick={() => setShow(true)}>
         
            Save segment</Button>
        </div>

        <ToastContainer position="middle-center" >
        <Toast onClose={() => setShowToast(false)} show={showtoast} delay={3000} autohide>
          <Toast.Header>
            <img
              src="holder.js/20x20?text=%20"
              className="rounded me-2"
              alt=""
            />
            <strong className="me-auto">Success!!!</strong>
            <small>Just now</small>
          </Toast.Header>
          <Toast.Body>No JSON response, but the request was successful.</Toast.Body>
        </Toast>
        </ToastContainer>
        </div>
      
    </>
  );
}
