using Amazon;
using Amazon.S3;
using Amazon.S3.Transfer;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace CREG.Analitica.AWS.API.Models
{
    public class UploadFileAPI_S3AWS
    {
        private static readonly RegionEndpoint bucketRegion = RegionEndpoint.USEast1;

        public bool sendFileToS3(string localFilePath, string bucketName, string subDirectoryInBucket, string fileNameInS3)
        {
            IAmazonS3 client = new AmazonS3Client(bucketRegion);

            // create a TransferUtility instance passing it the IAmazonS3 created in the first step
            TransferUtility utility = new TransferUtility(client);
            // making a TransferUtilityUploadRequest instance
            TransferUtilityUploadRequest request = new TransferUtilityUploadRequest();

            if (subDirectoryInBucket == "" || subDirectoryInBucket == null)
            {
                request.BucketName = bucketName; //no subdirectory just bucket name
            }
            else
            {   // subdirectory and bucket name
                request.BucketName = bucketName + @"/" + subDirectoryInBucket;
            }
            request.Key = fileNameInS3; //file name up in S3
            request.FilePath = localFilePath; //local file name
            try
            {
                utility.Upload(request); //commensing the transfer
            }
            catch
            {
                return false;
            }
            
            return true; //indicate that the file was sent

        }


        }
}