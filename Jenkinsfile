pipeline {
    agent any

    environment {
        // Docker image configuration
        DOCKER_IMAGE = 'angular-docker-app'
        DOCKER_TAG = "${BUILD_NUMBER}"
        // Optional: Docker registry (uncomment and configure if pushing to registry)
        // DOCKER_REGISTRY = 'your-registry.com'
        // DOCKER_CREDENTIALS_ID = 'docker-registry-credentials'
    }

    options {
        // Keep only last 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Add timestamps to console output
        timestamps()
        // Timeout after 30 minutes
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Building branch: ${env.BRANCH_NAME ?: 'main'}"
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('src') {
                    bat 'npm ci'
                }
            }
        }

        stage('Lint') {
            steps {
                dir('src') {
                    bat 'npm run lint || exit 0'
                }
            }
        }

        // stage('Test') {
        //     steps {
        //         dir('src') {
        //             bat 'npm run test -- --watch=false --browsers=ChromeHeadless || exit 0'
        //         }
        //     }
        // }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image: ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    bat "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -t ${DOCKER_IMAGE}:latest ."
                }
            }
        }

        // stage('Test Docker Image') {
        //     steps {
        //         script {
        //             // Run container for health check
        //             bat "docker run -d --name ${DOCKER_IMAGE}-test -p 8080:80 ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    
        //             // Wait for container to be ready
        //             sleep(time: 10, unit: 'SECONDS')
                    
        //             // Health check
        //             bat 'curl -f http://localhost:8080 || exit 1'
        //         }
        //     }
        //     post {
        //         always {
        //             script {
        //                 // Cleanup test container
        //                 bat "docker stop ${DOCKER_IMAGE}-test || exit 0"
        //                 bat "docker rm ${DOCKER_IMAGE}-test || exit 0"
        //             }
        //         }
        //     }
        // }

        // Uncomment this stage if you want to push to a Docker registry
        // stage('Push to Registry') {
        //     when {
        //         branch 'main'
        //     }
        //     steps {
        //         script {
        //             docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_CREDENTIALS_ID) {
        //                 bat "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}"
        //                 bat "docker tag ${DOCKER_IMAGE}:latest ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest"
        //                 bat "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}"
        //                 bat "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest"
        //             }
        //         }
        //     }
        // }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo 'Deploying application...'
                    bat 'docker-compose down --remove-orphans || exit 0'
                    bat 'docker-compose up --build -d'
                }
            }
        }
    }

    post {
        always {
            // Clean up dangling images
            bat 'docker image prune -f || exit 0'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
