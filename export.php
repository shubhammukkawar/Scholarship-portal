<?php
require('fpdf181/fpdf.php');
require_once('config.php');
require_once('database.php');

class PDF extends FPDF {
	// Page header
	function Header() {
		// Logo
		/*$this->Image('img/coeplogo.png',10,10,20,22);
		//border
		$this->Line(9, 9, $this->GetPageWidth() - 9, 9);
		$this->Line(9, 9, 9, 33);
		$this->Line(9, 33, $this->GetPageWidth() - 9, 33);
		$this->Line($this->GetPageWidth() - 9, 9, $this->GetPageWidth() - 9, 33);
		$this->Line(9, 33, 9, $this->GetPageHeight() - 18);
		$this->Line(9, $this->GetPageHeight() - 18, $this->GetPageWidth() - 9, $this->GetPageHeight() - 18);
		$this->Line($this->GetPageWidth() - 9, 33, $this->GetPageWidth() - 9, $this->GetPageHeight() - 18);*/
		// Arial bold 16
		$this->SetMargins(9, 9, 9);
		$this->SetFont('Arial','B',16);
		$query = "select sName from applicationForScholarship a inner join scholarship b on a.sId = b.sId where aId = " . $_POST["aId"] . ";";
		$rows = sqlGetAllRows($query);
		$str = "Application Form for ";
		for($j = 0;$j < count($rows);$j++) {
			$str .= $rows[$j]["sName"];
			if($j != count($rows) - 1)
				$str .= ", ";
		}
		$this->Cell(0, 10, $str, 0, 1, 'C');
		$this->Ln(10);
		// Move to the right
		/*$this->Cell(20);
		// Title
		$currX = $this->GetX();
		$this->Cell($this->GetPageWidth() - 40, 6, 'COLLEGE OF ENGINEERING, PUNE',0,1,'C');
		$this->SetFont('Arial','',10);
		$this->SetX($currX);
		$this->Cell($this->GetPageWidth() - 40, 4, '(An autonomous institute of Govt. of Maharashtra)',0,1,'C');
		$this->SetX($currX);
		$this->Cell($this->GetPageWidth() - 40, 4, 'Shivajinagar, Pune - 411 005',0,1,'C');
		// Line break
		$this->Ln(7);*/
	}

	// Page footer
	function Footer() {
		// Position at 1.5 cm from bottom
		$this->SetY(-15);
		// Arial italic 8
		$this->SetFont('Arial','',8);
		// Page number
		$this->Cell(0,10,'Page '.$this->PageNo().'/{nb}',0,0,'C');
	}
}
function printApplication() {
	if(!(isset($_POST["aId"]) and isset($_SESSION["username"])))
		return;
	$aId = $_POST["aId"];
	$query = "select * from applications a inner join year y inner join branch b on a.year = y.yCode and  a.branch = b.bCode where aId = $aId;";
	$row = sqlGetAllRows($query)[0];
	$pdf = new PDF('P', 'mm', 'A4');
	$pdf->AliasNbPages();
	$pdf->AddPage();
	$pdf->SetFont('Arial','',12);

	$width = $pdf->GetPageWidth() - 20;
	$leftX = $pdf->GetX();
	$i = 1;
	$lineHeight = 8;
	$CurY = $pdf->GetY();
	$imgWidth = 35;
	$imgHeight = 45;

	$pdf->Image(glob('uploads/' . $row["mis"] . "passportPhoto.*")[0],$pdf->GetPageWidth() - $imgWidth - 10,$CurY,$imgWidth, $imgHeight);
	$pdf->SetY($CurY);
	$pdf->Cell(0, $lineHeight, $i++ . ") Full Name : " . $row["fullName"], 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, $i++ . ") Date Of Birth : " . $row["DOB"], 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, $i++ . ") Local Address : " . $row["localAddr"], 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, "", 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, $i++ . ") Permanant Address : ", 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, $row["permanantAddr"], 0, 1, 'L');
	$pdf->Cell($width / 2, $lineHeight, "Ph / Mobile : " . $row["contactNo"], 0, 0, "L");
	$pdf->Cell($width / 2, $lineHeight, "Email : " . $row["email"], 0, 1, "L");
	$pdf->Cell(0, $lineHeight, $i++ . ") Proof of admission to B.Tech course : Class " . $row["yName"] . " Branch " . $row["bName"], 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, $i++ . ") Marks at : SSC " . $row["markSSC"] . " HSC " . $row["markHSC"] . " CET/AIEEE/DIPLOMA " . $row["markCompet"] , 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, "       " . " CPI of last year " . $row["cpi"] . " SPI of last semester " . $row["spi"], 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, $i++ . ") Annual Income of parent/ guardian from all sources, who is supporting your education ", 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, "   " . "Source Of Income " . $row["incomeSource"], 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, "   " . "Annual Income " . $row["annualIncome"], 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, $i++ . ") Members in the family : Brothers " . $row["familyBrothers"] . ", Sisters " . $row["familySisters"] . ", Total members in family " . $row["familyMembers"], 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, $i++ . ") Brothers studying in " . $row["brothersEducation"] . ", Sisters studying in " . $row["sistersEducation"], 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, $i++ . ") Immovable property : Own/rented/house/land(irrigated, not-irrigated), industry/shop etc. " . "", 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, $row["immovableProperty"], 0, 1, 'L');
	$pdf->Write($lineHeight, $i++ . ") Have you applied for, or are in receipt of any loan/assistance of scholarship to meet your educational expenses? If yes, give details. " . "");
	$pdf->Cell(0, $lineHeight, $row["otherBenefits"], 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, $i++ . ") Your financial requirments to support education ", 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, $row["finReq"], 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, $i++ . ") Any other achievements in the field of sports, arts, cultural etc." . "", 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, $row["achievements"], 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, "", 0, 1, 'L');
	$pdf->Cell(0, $lineHeight, "Signature of the applicant", 0, 1, 'R');
	$pdf->SetFont('Arial','B',12);
	$i = 1;
	$strWidth = $pdf->GetStringWidth("Attached Certificates : ");
	$CurX = $pdf->GetX();
	$pdf->Cell(0, $lineHeight, "Attached Certificates : " . $i++ . ") 10th, 12th Std and CET    " . $i++ . ")Admit Card of COEP", 0, 1, 'L');
	$pdf->SetX($strWidth + $CurX);
	$pdf->Cell(0, $lineHeight, $i++ . ") Family Income             " . $i++ . ")Extra curricular activities", 0, 1, 'L');
	//print date
	/*$pdf->Cell(0, 5, "Application for Non-Government Scholarships", 0, 1, 'C');
	$pdf->SetFont('Arial','',12);
	$pdf->Cell(50, 6, "Application Id : " . "1", 0, 0, "L");
	$pdf->Cell(0, 6, "DATE : " . Date('d/m/Y'), 0, 1, 'R');
	$pdf->Cell(0, 6, "Full Name : " . "Ajinkya Pralhad Wandale", 0, 1, "L");
	$pdf->Cell(0, 6, "MIS : " . "111508072", 0, 1, "L");
	$pdf->Cell($width / 2, 6, "Mother's Name : " . "Usha", 0, 0, "L");
	$pdf->Cell(0, 6, "Gender : " . "Male", 0, 1, "L");
	$pdf->Cell($width / 2, 6, "Category : " . "OBC", 0, 0, "L");
	$pdf->Cell(0, 6, "Caste : " . "Bari", 0, 1, "L");
	$pdf->Cell(0, 6, "Email-Id : " . "wandaleap15.it@coep.ac.in", 0, 1, "L");
	$pdf->Cell(0, 6, "Contact No : " . "7387856142", 0, 1, "L");
	$currY = $pdf->GetY();
	$strWidth = $pdf->GetStringWidth("Current Address : ");
	$pdf->Cell($strWidth, 6, "Current Address : ", 0, 0, "L");
	$pdf->MultiCell($width / 2 - $strWidth, 6, "COEP Hostel Campus\nShivajinagr\nPune", 0, "L");
	$pdf->SetY($currY);
	$pdf->SetX($width / 2 + 10);
	$strWidth = $pdf->GetStringWidth("Permanant Address : ");
	$pdf->Cell($strWidth, 6, "Permanant Address : ", 0, 0, "L");
	$pdf->MultiCell($width / 2 - $strWidth, 6, "Aras Lay Out\nWard No. 20\nBuldana", 0, "L");
	$pdf->Cell(0, 6, "Aadhar No : " . "1111111111111", 0, 1, "L");
	$pdf->Cell(0, 6, "SBI Account No : " . "11111111111", 0, 1, "L");
	$pdf->Cell(0, 6, "Annual Family Income : " . "550000", 0, 1, "L");
	$pdf->Cell(0, 6, "Class 10 Marks : " . "95", 0, 1, "L");
	$pdf->Cell(0, 6, "Class 12 Marks : " . "93", 0, 1, "L");
	$pdf->Cell(0, 6, "CET Marks : " . "150", 0, 1, "L");
	$pdf->Cell(0, 6, "Cgpa : " . "8.92", 0, 1, "L");
	$currY = $pdf->GetY();
	$strWidth = $pdf->GetStringWidth("Extracurricular Activities : ");
	$pdf->Cell($strWidth, 6, "Extracurricular Activities : ", 0, 0, "L");
	$pdf->MultiCell($width / 2 - $strWidth, 6, "COEP Hostel Campus\nShivajinagr\nPune", 0, "L");
	$pdf->SetY($currY);
	$pdf->SetX($width / 2 + 10);
	$strWidth = $pdf->GetStringWidth("Achievements : ");
	$pdf->Cell($strWidth, 6, "Achievements : ", 0, 0, "L");
	$pdf->MultiCell($width / 2 - $strWidth, 6, "Aras Lay Out\nWard No. 20\nBuldana", 0, "L");*/
	//write File
	$pdf->Output('F', "tmp/output.pdf");
	$filename = "tmp/output.pdf";
	/*header("Cache-Control: public");
	header("Content-Description: File Transfer");
	header("Content-disposition: attachment");
	header("filename:". $filename);
	header('Content-type: application/pdf');
	header("Content-Transfer-Encoding: binary");
	ob_clean();
	flush();
	readfile($filename);*/
	echo "{\"success\" : true, \"path\" : \"$filename\"}";
}
session_start();
printApplication();
?>
