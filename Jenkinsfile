def notifyBuild(String buildStatus = 'STARTED') {
  // build status of null means successful
  buildStatus =  buildStatus ?: 'SUCCESSFUL'

  emailext (
      subject: "${buildStatus}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
      to: '$DEFAULT_RECIPIENTS',
      body: """
STARTED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':

Check console output at "${env.JENKINS_URL}/job/${env.JOB_NAME}/${env.BUILD_NUMBER}"
"""
    )
}
def notifyFailed() {
  emailext (
      subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
      to: '$DEFAULT_RECIPIENTS',
      body: """
FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':

Check console output at "${env.JENKINS_URL}/job/${env.JOB_NAME}/${env.BUILD_NUMBER}"
"""
    )
}
def notifySuccessful() {
  emailext (
      subject: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
      to:'$DEFAULT_RECIPIENTS',
      body: """
SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':

Check console output at "${env.JENKINS_URL}/job/${env.JOB_NAME}/${env.BUILD_NUMBER}"
"""
    )
}

pipeline {
	agent any

	post{
		failure{
			notifyBuild("FAILED")
		}
		success{
			notifySuccessful()
		}
	}

	stages {
		stage('Notify'){
			steps{
				notifyBuild()
			}
		}
		stage( 'Run Tests' ) {
		    parallel {
		        stage( 'NodeJS-16 Tests') {
		            agent { label 'nodejs-16' }
        			steps {
        				withCredentials([string(credentialsId: 'github-access-token', variable: 'GITHUBTOKEN')]) {
        					sh """
        						git clone https://github.com/Michaelpalacce/EventRequest.git eventRequest
        						cd eventRequest
        						git remote set-url origin https://$GITHUBTOKEN@github.com/Michaelpalacce/EventRequest.git
                				npm i
                				node test.js --silent
        					"""
        				}
        			}
		        }


        		stage( 'NodeJS-14 Tests' ) {
        		    agent { label 'nodejs-14' }
        			steps {
        				withCredentials([string(credentialsId: 'github-access-token', variable: 'GITHUBTOKEN')]) {
        					sh """
        						git clone https://github.com/Michaelpalacce/EventRequest.git eventRequest
        						cd eventRequest
        						git remote set-url origin https://$GITHUBTOKEN@github.com/Michaelpalacce/EventRequest.git
                				npm i
                				node test.js --silent
        					"""
        				}
        			}
        		}

				stage( 'NodeJS-12 Tests' ) {
        		    agent { label 'nodejs-12' }
        			steps {
        				withCredentials([string(credentialsId: 'github-access-token', variable: 'GITHUBTOKEN')]) {
        					sh """
        						git clone https://github.com/Michaelpalacce/EventRequest.git eventRequest
        						cd eventRequest
        						git remote set-url origin https://$GITHUBTOKEN@github.com/Michaelpalacce/EventRequest.git
                				npm i
                				node test.js --silent
        					"""
        				}
        			}
        		}
		    }
		}

		stage( 'NodeJS-16 commit' ) {
		    agent { label 'nodejs-16' }
			steps {
			    withCredentials([string(credentialsId: 'github-access-token', variable: 'GITHUBTOKEN')]) {
    				withCredentials([string(credentialsId: 'npm-access-token', variable: 'NPMTOKEN')]) {
    					sh """
        					git clone https://github.com/Michaelpalacce/EventRequest.git eventRequest
        					cd eventRequest
    					    echo "//registry.npmjs.org/:_authToken=$NPMTOKEN" >> ~/.npmrc
    					    npm publish
    					"""
    				}
				}
			}
		}
   }
}