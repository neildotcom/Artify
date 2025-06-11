import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json'; // or .ts depending on your config

Amplify.configure(outputs);