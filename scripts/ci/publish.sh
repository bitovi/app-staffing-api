#!/bin/bash


#Defining the Image name variable
IMAGE_NAME=$(echo $GITHUB_REPOSITORY | sed 's/^.*\///')

#Defining the Registry url variable
REGISTRY_URL=$(printf %s.dkr.ecr.%s.amazonaws.com/%s "$AWS_ACCOUNT_NO" "$AWS_DEFAULT_REGION" "$IMAGE_NAME")

#Defining the Branch name variable
BRANCH_NAME=$(echo $GITHUB_REF | awk -F"  +|/" '{print $5, $NF}')


#Defining the Default branch variable
if [ -z "$DEFAULT_BRANCH" ]; then
    DEFAULT_BRANCH="main"
fi


#Building the docker image...
if [ -z "$PROD_TARGET_STAGE_NAME" ]; then
    PROD_TARGET_STAGE_NAME="production"
fi
docker build --target=${PROD_TARGET_STAGE_NAME}  -t ${IMAGE_NAME} .


#prepping image tag variable
DEFAULT_IMAGE_TAG="latest"
echo "Using image tag:"
if [ -n "$IMAGE_TAG" ]; then
    echo "  IMAGE_TAG set: $IMAGE_TAG"
elif [[ ${BRANCH_NAME} == ${DEFAULT_BRANCH} ]]; then
    echo "  BRANCH is default branch ($BRANCH_NAME). Using default: $DEFAULT_IMAGE_TAG"
    IMAGE_TAG="$DEFAULT_IMAGE_TAG"
elif [[ -n "$GITHUB_HEAD_REF" ]]; then
    echo "  is PR. Using PR branch: $GITHUB_HEAD_REF"
    IMAGE_TAG="$GITHUB_HEAD_REF"
else
    echo "  Using SHA: $GITHUB_SHA"
    IMAGE_TAG=${GITHUB_SHA}
fi

#docker image deploy function
aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${REGISTRY_URL}    
docker tag ${IMAGE_NAME} ${REGISTRY_URL}:${IMAGE_TAG}

echo "Pushing the docker image to the ecr repository..."
echo "  ${REGISTRY_URL}:${IMAGE_TAG}"
docker push ${REGISTRY_URL}:${IMAGE_TAG}