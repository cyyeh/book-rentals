import styled from 'styled-components'
import { Form } from 'react-bootstrap'

export const AuthenticationPageContainer = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`

export const AuthenticationFormContainer = styled.div`
  padding: 40px;
  border: 1px solid darkgray;
  border-radius: 10px;
`

export const SiteTitle = styled.h1`
  text-align: center;
`

export const FormContainer = styled(Form)`
  padding: 20px;
`

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
`
