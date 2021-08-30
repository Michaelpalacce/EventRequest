def notifyBuild(String buildStatus = 'STARTED') {
  // build status of null means successful
  buildStatus =  buildStatus ?: 'SUCCESSFUL'

  emailext (
      subject: "${buildStatus}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
      to: '$DEFAULT_RECIPIENTS',
      body: """
Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':

Check console output at "${env.JENKINS_URL}job/${env.JOB_NAME}/${env.BUILD_NUMBER}"
"""
    )
}
def notifyFailed() {
  emailext (
      subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
      to: '$DEFAULT_RECIPIENTS',
      body: """
FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':

Check console output at "${env.JENKINS_URL}job/${env.JOB_NAME}/${env.BUILD_NUMBER}"
"""
    )
}
def notifySuccessful() {
  emailext (
      subject: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
      to:'$DEFAULT_RECIPIENTS',
      body: """
SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':

Check console output at "${env.JENKINS_URL}job/${env.JOB_NAME}/${env.BUILD_NUMBER}"
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
		stage( 'NodeJS-16 Tests') {
			agent { label 'nodejs-16' }
			steps {
				sh """
					npm ci
					node test.js --silent
				"""
			}
		}


		stage( 'NodeJS-14 Tests' ) {
			agent { label 'nodejs-14' }
			steps {
				sh """
					npm ci
					node test.js --silent
				"""
			}
		}

		stage( 'NodeJS-12 Tests' ) {
			agent { label 'nodejs-12' }
			steps {
				sh """
					npm ci
					node test.js --silent
				"""
			}
		}

		stage( 'NodeJS-16 commit' ) {
			agent { label 'nodejs-16' }
			steps {
				script {
					if ( commit.toBoolean() )
					{
						withCredentials([string(credentialsId: 'npm-access-token', variable: 'NPMTOKEN')]) {
							sh """
								echo "//registry.npmjs.org/:_authToken=$NPMTOKEN" >> ~/.npmrc
								npm publish
							"""
						}
					}
				}
			}
		}
	}
}