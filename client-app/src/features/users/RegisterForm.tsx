import { ErrorMessage, Form, Formik } from 'formik';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Button, Header } from 'semantic-ui-react';
import MyTextInput from '../../app/common/form/MyTextInput';
import { useStore } from '../../app/stores/stores';
import * as Yup from 'yup';
import ValidationErrors from '../errors/ValidationErrors';

 function RegisterForm() {
    const {userStore} = useStore();
    return (
        <Formik initialValues={{displayName: '', userName: '', email: '', password: '', error: null}}
                onSubmit={(values, {setErrors}) => userStore.register(values)
                                    .catch(error => setErrors({error: error}))}
                validationSchema={Yup.object({
                    displayName: Yup.string().required(),
                    userName: Yup.string().required(),
                    email: Yup.string().required().email(),
                    password: Yup.string().required(),
                })}
            >
            {({handleSubmit, isSubmitting, errors, isValid, dirty}) => (
                <Form className="ui form error" onSubmit={handleSubmit} autoComplete='off'>
                    <Header as='h2' content='Sign pp to Reactivities' color='teal' textAlign='center' />
                    <MyTextInput name='displayName' placeholder='Display name' />
                    <MyTextInput name='userName' placeholder='Username' />
                    <MyTextInput name='email' placeholder='Email' />
                    <MyTextInput name='password' placeholder='Password' type='password' />
                    <ErrorMessage
                        name='error' render={() => <ValidationErrors errors={errors.error} />}
                    />
                    <Button disabled={!isValid || !dirty || isSubmitting} 
                        loading={isSubmitting} positive content='Login' type='submit' fluid/>
                </Form>
            )}
        </Formik>
    )
}

export default observer(RegisterForm);